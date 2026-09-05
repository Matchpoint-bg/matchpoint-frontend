import type { Slot } from './court.types';

/** The API's slot grid is fixed at half-hour steps (`ReservationService.get_availability`). */
export const SLOT_MINUTES = 30;

/**
 * The clubs are all in Sofia and the API stamps its datetimes with that offset
 * (`TIME_ZONE = "Europe/Sofia"`). Shown as the label above the booking grid; once
 * clubs carry a timezone of their own this is where it comes from.
 */
export const CLUB_TIMEZONE = 'Europe/Sofia';

/**
 * Fills in the fields the API does not send.
 *
 * `CourtOpeningSerializer` answers with `{start, end, available, price}` only, but
 * the booking UI selects on `status` — an undefined one makes every slot
 * unselectable. Derive it once here so a court grid and the club-wide grid agree.
 *
 * The API cannot tell a reservation from an exceptional closure (both arrive as
 * `available: false`), so both read as "booked", matching `SlotGrid`'s own fallback.
 */
export function normalizeSlots(slots: Slot[], now: number = Date.now()): Slot[] {
  return slots.map((slot) => ({
    ...slot,
    status:
      slot.status ??
      (new Date(slot.end).getTime() <= now
        ? 'past'
        : slot.available
          ? 'available'
          : 'booked'),
    currency: slot.currency ?? 'BGN',
  }));
}
