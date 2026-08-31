import { useQueries } from '@tanstack/react-query';
import { availabilityQueryOptions } from '../../courts';
import type { Court, Slot } from '../../courts';

export interface CourtAvailability {
  court: Court;
  slots: Slot[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Availability for every court in a club on one date.
 *
 * The API only exposes `GET /api/courts/:id/availabilities/`, so this fans out
 * one query per court. That is the interim shape ToDoRedesign §8 warns about —
 * when a club-level availability endpoint lands, this hook is the only thing
 * that has to change.
 *
 * Loading and errors are reported per court, so one court failing to load
 * leaves the rest bookable instead of blanking the page.
 */
export function useClubAvailability(courts: Court[], date: string): CourtAvailability[] {
  const results = useQueries({
    queries: courts.map((court) => availabilityQueryOptions(court.id, date)),
  });

  return courts.map((court, index) => {
    const result = results[index];
    return {
      court,
      slots: result?.data ?? [],
      loading: result?.isPending ?? true,
      error: result?.error instanceof Error ? result.error.message : null,
      reload: () => void result?.refetch(),
    };
  });
}
