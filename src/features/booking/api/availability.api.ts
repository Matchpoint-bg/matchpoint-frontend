import { DEMO, demoAvailability } from '../../../demo/demoData';
import { httpClient } from '../../../shared/api/httpClient';
import { store } from '../../../shared/storage/store';
import type { ClubAvailabilityResponse } from '../model/availability.types';

export const availabilityApi = {
  club: async (clubId: number, date: string): Promise<ClubAvailabilityResponse> => {
    if (store.demo) {
      return {
        club_id: clubId,
        date,
        timezone: 'Europe/Sofia',
        slot_minutes: 30,
        courts: DEMO.courts
          .filter((court) => court.club_id === clubId)
          .map((court) => ({ court, slots: demoAvailability(court.id, date) })),
      };
    }

    // One aggregate request by design. When the backend is connected, only
    // this adapter needs to change if its serializer uses a different shape.
    return httpClient.json<ClubAvailabilityResponse>(
      `/api/clubs/${clubId}/availability/?date=${encodeURIComponent(date)}`,
    );
  },
};
