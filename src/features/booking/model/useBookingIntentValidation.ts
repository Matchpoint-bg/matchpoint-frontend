import { useMemo } from 'react';
import { useClubAvailabilityQuery } from './availability.queries';
import { bookingIntentStore } from './bookingIntent.store';

export function useBookingIntentValidation(courtId: number) {
  const intent = useMemo(() => {
    const stored = bookingIntentStore.get();
    return stored?.courtId === courtId ? stored : null;
  }, [courtId]);
  const query = useClubAvailabilityQuery(intent?.clubId ?? Number.NaN, intent?.date ?? '');

  const valid = useMemo(() => {
    if (!intent || !query.data) return false;
    const row = query.data.courts.find((item) => item.court.id === intent.courtId);
    if (!row) return false;
    const chosen = row.slots.filter(
      (slot) => slot.start >= intent.start && slot.end <= intent.end,
    );
    const expectedCount = intent.durationMinutes / query.data.slot_minutes;
    const total = chosen.reduce((sum, slot) => sum + slot.price, 0);
    return (
      chosen.length === expectedCount &&
      chosen.every((slot) => slot.status === 'available') &&
      Math.abs(total - intent.quotedPrice) < 0.01
    );
  }, [intent, query.data]);

  return { intent, query, valid };
}
