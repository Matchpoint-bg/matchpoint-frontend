import { useEffect, useMemo, useState } from 'react';
import type { CourtAvailability } from './availability.types';

interface SelectionState {
  courtId: number;
  indices: number[];
}

export function useClubSlotSelection(rows: CourtAvailability[], resetKey: string) {
  const [state, setState] = useState<SelectionState | null>(null);

  useEffect(() => setState(null), [resetKey]);

  const selection = useMemo(() => {
    if (!state) return null;
    const row = rows.find((item) => item.court.id === state.courtId);
    if (!row || state.indices.length === 0) return null;
    const indices = [...state.indices].sort((a, b) => a - b);
    const selectedSlots = indices.flatMap((index) => {
      const slot = row.slots[index];
      return slot ? [slot] : [];
    });
    const first = selectedSlots[0];
    const last = selectedSlots[selectedSlots.length - 1];
    if (!first || !last) return null;
    return {
      court: row.court,
      indices,
      first,
      last,
      count: selectedSlots.length,
      total: selectedSlots.reduce((sum, slot) => sum + slot.price, 0),
    };
  }, [rows, state]);

  const toggle = (courtId: number, index: number) => {
    const row = rows.find((item) => item.court.id === courtId);
    if (!row || row.slots[index]?.status !== 'available') return;

    setState((current) => {
      if (!current || current.courtId !== courtId) return { courtId, indices: [index] };
      if (current.indices.includes(index)) return null;

      const start = Math.min(index, ...current.indices);
      const end = Math.max(index, ...current.indices);
      const range = Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
      const contiguous = range.every((slotIndex) => row.slots[slotIndex]?.status === 'available');
      return contiguous ? { courtId, indices: range } : { courtId, indices: [index] };
    });
  };

  return {
    selection,
    selected: (courtId: number) => (state?.courtId === courtId ? state.indices : []),
    toggle,
    clear: () => setState(null),
  };
}
