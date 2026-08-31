import type { Slot, SlotStatus } from '../../courts';
import type { TranslationKey } from '../../../i18n/en';

/**
 * Collapses a slot into one of the five states the availability UI draws
 * (ToDoRedesign §9). The API still answers with a bare `available` boolean, so
 * everything but `booked` has to be inferred here; when the backend starts
 * sending `status` we honour it and the rest of this becomes the fallback.
 */
export function slotStatus(slot: Slot, now: Date): SlotStatus {
  if (slot.status) return slot.status;
  // A slot the clock has passed is unbookable whatever the server said.
  if (new Date(slot.end).getTime() <= now.getTime()) return 'past';
  const booked = slot._booked !== undefined ? slot._booked : !slot.available;
  if (booked) return 'booked';
  return slot.available ? 'available' : 'closed';
}

export function isSelectable(status: SlotStatus): boolean {
  return status === 'available';
}

/**
 * Short explanation for a slot the player cannot take. `null` where the state
 * speaks for itself — an open slot needs no reason, and `closed` is already
 * drawn as "outside opening hours" by the grid's own empty state.
 */
export function slotReasonKey(status: SlotStatus): TranslationKey | null {
  switch (status) {
    case 'booked':
      return 'slot_reason_booked';
    case 'held':
      return 'slot_reason_held';
    case 'closed':
      return 'slot_reason_closed';
    case 'past':
      return 'slot_reason_past';
    default:
      return null;
  }
}
