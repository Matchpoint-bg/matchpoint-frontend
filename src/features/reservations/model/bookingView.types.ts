import type { ReservationStatus } from './reservationStatus';
import type { Reservation } from './reservation.types';

/**
 * Everything a screen needs to show one booking, assembled from the three
 * places it actually lives: the reservation row, the court and club behind it,
 * and the confirmation snapshot the player's own browser kept.
 *
 * The API sends none of this joined up (§15), so `useBookingViews` does the
 * joining once and every bookings screen reads the result.
 */
export interface BookingView {
  id: number;
  reservation: Reservation;
  status: ReservationStatus;
  reference: string;
  clubId: number | null;
  clubName: string;
  clubAddress: string;
  courtId: number;
  courtName: string;
  surface: string;
  date: string;
  start: string;
  end: string;
  durationMinutes: number;
  /** `null`, never `0`: a price the API did not send is unknown, not free. */
  price: number | null;
  currency: 'BGN';
  cancellationPolicy: string;
  latitude?: number;
  longitude?: number;
  /** False while the court or club behind this booking is still loading. */
  resolved: boolean;
}
