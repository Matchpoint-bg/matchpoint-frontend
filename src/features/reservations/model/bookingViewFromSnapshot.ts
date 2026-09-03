import type { BookingConfirmationSnapshot } from '../../booking/model/bookingIntent.types';
import type { BookingView } from './bookingView.types';
import { reservationStatus } from './reservationStatus';

/**
 * The view a player sees when the snapshot is all we have — the booking went
 * through, but the reservations list has not caught up (or failed to load).
 * Everything here was quoted to them moments ago, so it is worth showing.
 */
export function bookingViewFromSnapshot(
  snapshot: BookingConfirmationSnapshot,
  now: number = Date.now(),
): BookingView {
  const reservation = {
    id: snapshot.reservationId,
    court: snapshot.courtId,
    start_datetime: snapshot.start,
    end_datetime: snapshot.end,
    ...(Number.isFinite(snapshot.quotedPrice) ? { reservation_amt: snapshot.quotedPrice } : {}),
  };

  return {
    id: snapshot.reservationId,
    reservation,
    status: reservationStatus(reservation, now),
    reference: snapshot.bookingReference,
    clubId: Number.isFinite(snapshot.clubId) ? snapshot.clubId : null,
    clubName: snapshot.clubName,
    clubAddress: snapshot.clubAddress,
    courtId: snapshot.courtId,
    courtName: snapshot.courtName,
    surface: snapshot.surface,
    date: snapshot.date,
    start: snapshot.start,
    end: snapshot.end,
    durationMinutes: snapshot.durationMinutes,
    price: Number.isFinite(snapshot.quotedPrice) ? snapshot.quotedPrice : null,
    currency: snapshot.currency,
    cancellationPolicy: snapshot.cancellationPolicy,
    resolved: true,
  };
}
