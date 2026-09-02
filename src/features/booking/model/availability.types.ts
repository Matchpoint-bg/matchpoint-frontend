import type { Court, Slot } from '../../courts';

export interface CourtAvailability {
  court: Court;
  slots: Slot[];
}

/**
 * Aggregate contract expected from the future backend. The UI consumes this
 * shape regardless of whether the source is the local mock or the API.
 */
export interface ClubAvailabilityResponse {
  club_id: number;
  date: string;
  timezone: string;
  slot_minutes: number;
  courts: CourtAvailability[];
}
