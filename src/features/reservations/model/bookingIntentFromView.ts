import type { BookingIntent } from '../../booking/model/bookingIntent.types';
import type { BookingView } from './bookingView.types';

/**
 * Lets a confirmed booking reuse `BookingIntentCard`, which speaks in intents.
 * `NaN` for a missing price is deliberate — the card renders it as "—".
 */
export function bookingIntentFromView(view: BookingView): BookingIntent {
  return {
    version: 1,
    clubId: view.clubId ?? Number.NaN,
    clubName: view.clubName,
    clubAddress: view.clubAddress,
    courtId: view.courtId,
    courtName: view.courtName,
    surface: view.surface,
    date: view.date,
    start: view.start,
    end: view.end,
    durationMinutes: view.durationMinutes,
    quotedPrice: view.price ?? Number.NaN,
    currency: view.currency,
    cancellationPolicy: view.cancellationPolicy,
    paymentMethod: 'pay_on_site',
    createdAt: view.start,
  };
}
