import { DEMO, demoAvailability } from '../../../demo/demoData';
import { ApiError, httpClient } from '../../../shared/api/httpClient';
import { store } from '../../../shared/storage/store';
import { CLUB_TIMEZONE, normalizeSlots, SLOT_MINUTES } from '../../courts/model/slots';
import type { Court, Slot } from '../../courts/model/court.types';
import type { ClubAvailabilityResponse, CourtAvailability } from '../model/availability.types';

/**
 * A club whose opening hours do not cover the requested weekday.
 *
 * `ReservationService.get_availability` raises `NoOpeningTimesFound` in that case,
 * which the API returns as a 400 — a closed day, not a failure. Every other status
 * is a real error and must reach the caller.
 */
function isClosedDay(error: unknown): boolean {
  return error instanceof ApiError && error.status === 400;
}

async function courtRow(court: Court, date: string): Promise<CourtAvailability> {
  try {
    const slots = await httpClient.json<Slot[]>(
      `/api/courts/${court.id}/availabilities/?date=${encodeURIComponent(date)}`,
    );
    return { court, slots: normalizeSlots(slots) };
  } catch (error) {
    if (isClosedDay(error)) return { court, slots: [] };
    throw error;
  }
}

export const availabilityApi = {
  club: async (clubId: number, date: string): Promise<ClubAvailabilityResponse> => {
    if (store.demo) {
      return {
        club_id: clubId,
        date,
        timezone: CLUB_TIMEZONE,
        slot_minutes: SLOT_MINUTES,
        courts: DEMO.courts
          .filter((court) => court.club_id === clubId)
          .map((court) => ({ court, slots: demoAvailability(court.id, date) })),
      };
    }

    // The backend has no club-wide availability endpoint — `/api/clubs/{id}/availability/`
    // is a 404 — so the aggregate is assembled here from the two endpoints that do
    // exist: the club's courts, then every court's grid for the date, in parallel.
    // If one is ever added, this adapter is the only thing that changes.
    const courts = await httpClient.json<Court[]>(`/api/clubs/${clubId}/courts/`);
    const rows = await Promise.all(courts.map((court) => courtRow(court, date)));

    return {
      club_id: clubId,
      date,
      timezone: CLUB_TIMEZONE,
      slot_minutes: SLOT_MINUTES,
      courts: rows,
    };
  },
};
