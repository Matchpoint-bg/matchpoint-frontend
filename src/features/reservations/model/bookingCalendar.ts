import type { CalendarEvent } from '../../../shared/lib/calendar';
import type { BookingView } from './bookingView.types';

/**
 * The calendar entry for a booking. `shared/lib/calendar` does the RFC 5545
 * work; this decides what a MatchPoint booking is *called* in someone's diary,
 * in one place, so the list, the details page and the confirmation all agree.
 */
export function bookingCalendarEvent(
  view: BookingView,
  { referenceLabel }: { referenceLabel: string },
): CalendarEvent {
  const location = view.clubAddress || view.clubName;
  return {
    uid: `${view.reference}@matchpoint.bg`,
    title: `${view.courtName} · ${view.clubName}`,
    location,
    description: `${referenceLabel}: ${view.reference}`,
    start: new Date(view.start),
    end: new Date(view.end),
  };
}
