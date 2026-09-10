import type { BookingConfirmationSnapshot, BookingIntent } from './bookingIntent.types';

const INTENT_KEY = 'mp_booking_intent';
const CONFIRMATION_PREFIX = 'mp_booking_confirmation_';

function parse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export const bookingIntentStore = {
  get(): BookingIntent | null {
    return parse<BookingIntent>(sessionStorage.getItem(INTENT_KEY));
  },
  save(intent: BookingIntent): void {
    sessionStorage.setItem(INTENT_KEY, JSON.stringify(intent));
  },
  clear(): void {
    sessionStorage.removeItem(INTENT_KEY);
  },
  saveConfirmation(snapshot: BookingConfirmationSnapshot): void {
    sessionStorage.setItem(
      `${CONFIRMATION_PREFIX}${snapshot.reservationId}`,
      JSON.stringify(snapshot),
    );
  },
  confirmation(id: number): BookingConfirmationSnapshot | null {
    return parse<BookingConfirmationSnapshot>(
      sessionStorage.getItem(`${CONFIRMATION_PREFIX}${id}`),
    );
  },
};

export function bookingIntentUrl(intent: BookingIntent): string {
  const params = new URLSearchParams({
    date: intent.date,
    start: intent.start,
    end: intent.end,
  });
  if (intent.rescheduleOf !== undefined) params.set('reschedule', String(intent.rescheduleOf));
  return `/book/${intent.courtId}/review?${params.toString()}`;
}

/**
 * Back to the availability this intent came from. Carries `reschedule` along —
 * without it, "change time" would quietly drop a player who is moving a booking
 * into a flow that creates a second one.
 */
export function clubBookingUrl(intent: BookingIntent): string {
  const params = new URLSearchParams({ date: intent.date });
  if (intent.rescheduleOf !== undefined) params.set('reschedule', String(intent.rescheduleOf));
  return `/clubs/${intent.clubId}?${params.toString()}`;
}
