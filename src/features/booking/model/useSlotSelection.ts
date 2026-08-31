import { useEffect, useMemo, useState } from 'react';
import type { Slot } from '../../courts';
import { isSelectable, slotStatus } from './slotStatus';

const SLOT_MINUTES = 30;

export interface SelectionState {
  courtId: number;
  indices: number[];
}

/**
 * The whole selection rule, as a pure transition — kept out of the hook so the
 * contiguity behaviour can be read (and exercised) on its own.
 *
 * Invariant: the result is always a single unbroken run of free slots on one
 * court, so no caller ever has to handle a gapped selection.
 */
export function nextSelection(
  current: SelectionState | null,
  courtId: number,
  index: number,
  slots: Slot[],
  now: Date,
): SelectionState | null {
  const free = (i: number) => {
    const slot = slots[i];
    return Boolean(slot) && isSelectable(slotStatus(slot as Slot, now));
  };
  if (!free(index)) return current;

  const start: SelectionState = { courtId, indices: [index] };
  if (!current || current.courtId !== courtId) return start;

  const { indices } = current;
  const first = indices[0] ?? -1;
  const last = indices[indices.length - 1] ?? -1;

  // Tapping either end shrinks the run; tapping its only slot clears it.
  if (index === first && index === last) return null;
  if (index === first) return { courtId, indices: indices.slice(1) };
  if (index === last) return { courtId, indices: indices.slice(0, -1) };
  // Inside the run: collapse to just that slot rather than splitting it in two.
  if (index > first && index < last) return start;

  // Outside the run: grow to reach it, but only across slots that are still
  // free. A blocked slot in between means the run cannot legally stretch that
  // far, so we restart at the tap instead of leaving a gap.
  const span: number[] = [];
  for (let i = Math.min(index, first); i <= Math.max(index, last); i++) {
    if (!free(i)) return start;
    span.push(i);
  }
  return { courtId, indices: span };
}

/**
 * Slot selection for a whole club page: one contiguous run, on one court.
 *
 * ToDoRedesign §9 asks that non-contiguous selection be prevented or corrected
 * rather than merely flagged, so `toggle` never produces a gap — a tap that
 * cannot extend the current run starts a new one. Picking in a different court
 * likewise replaces the selection instead of merging across courts.
 */
export function useSlotSelection(
  slotsByCourt: Map<number, Slot[]> | Record<number, Slot[]>,
  resetKey: string,
) {
  const [state, setState] = useState<SelectionState | null>(null);

  useEffect(() => setState(null), [resetKey]);

  const lookup = useMemo(
    () => (slotsByCourt instanceof Map ? slotsByCourt : new Map(Object.entries(slotsByCourt).map(([id, slots]) => [Number(id), slots]))),
    [slotsByCourt],
  );

  const selection = useMemo(() => {
    const slots = state ? (lookup.get(state.courtId) ?? []) : [];
    const indices = state ? state.indices : [];
    const picked = indices.map((index) => slots[index]).filter((slot): slot is Slot => Boolean(slot));
    return {
      courtId: state?.courtId ?? null,
      indices,
      first: picked[0],
      last: picked[picked.length - 1],
      total: picked.reduce((sum, slot) => sum + slot.price, 0),
      minutes: picked.length * SLOT_MINUTES,
    };
  }, [lookup, state]);

  const isOn = (courtId: number, index: number) =>
    state?.courtId === courtId && state.indices.includes(index);

  const toggle = (courtId: number, index: number) => {
    const slots = lookup.get(courtId) ?? [];
    setState((current) => nextSelection(current, courtId, index, slots, new Date()));
  };

  return { ...selection, isOn, toggle, clear: () => setState(null) };
}
