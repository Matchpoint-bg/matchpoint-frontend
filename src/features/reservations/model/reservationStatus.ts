import type { BookingStatusValue } from '../../../shared/ui/Badge/BookingStatus';
import type { Reservation } from './reservation.types';

export type ReservationStatus = BookingStatusValue;

/**
 * Derived from the clock, because the API sends no status field (§15).
 *
 * That leaves `confirmed` and `completed` as the only reachable values:
 * cancelling hard-deletes the row, and nothing reports payment or attendance.
 * `pending`, `cancelled` and `no_show` stay in the type so the badge is ready
 * for the day a real status arrives — and so this function is the only place
 * that has to learn about it.
 */
export function reservationStatus(
  reservation: Reservation,
  now: number = Date.now(),
): ReservationStatus {
  return isUpcoming(reservation, now) ? 'confirmed' : 'completed';
}

export function isUpcoming(reservation: Reservation, now: number = Date.now()): boolean {
  return new Date(reservation.end_datetime).getTime() >= now;
}

/**
 * Splits a list in one pass, so every card on the page agrees on where "now"
 * was — two `Date.now()` calls either side of a midnight boundary do not.
 */
export function partitionReservations(
  reservations: Reservation[],
  now: number = Date.now(),
): { upcoming: Reservation[]; past: Reservation[] } {
  const upcoming: Reservation[] = [];
  const past: Reservation[] = [];
  reservations.forEach((reservation) => {
    (isUpcoming(reservation, now) ? upcoming : past).push(reservation);
  });
  return { upcoming, past };
}
