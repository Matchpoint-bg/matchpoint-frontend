import { DEMO } from '../../../demo/demoData';
import { httpClient } from '../../../shared/api/httpClient';
import { store } from '../../../shared/storage/store';
import type { Court } from '../../courts/model/court.types';
import type { Club, Employee, OpeningHour } from '../model/club.types';

export const clubsApi = {
  list: async (): Promise<Club[]> =>
    store.demo ? DEMO.clubs : httpClient.json<Club[]>('/api/clubs/'),

  get: async (id: number): Promise<Club | null> =>
    store.demo
      ? (DEMO.clubs.find((club) => club.id === id) ?? null)
      : httpClient.json<Club>(`/api/clubs/${id}/`),

  courts: async (id: number): Promise<Court[]> =>
    store.demo
      ? DEMO.courts.filter((court) => court.club_id === id)
      : httpClient.json<Court[]>(`/api/clubs/${id}/courts/`),

  openingHours: async (id: number): Promise<OpeningHour[]> =>
    store.demo
      ? (DEMO.openingHours[id] || []).map((row, index) => ({
          pk: index + 1,
          weekday: row[0],
          opening_hour: row[1],
          closing_hour: row[2],
        }))
      : httpClient.json<OpeningHour[]>(`/api/clubs/${id}/opening-hours/`),

  employees: async (id: number): Promise<Employee[]> =>
    store.demo
      ? DEMO.employees[id] || []
      : httpClient.json<Employee[]>(`/api/clubs/${id}/employees/`),

  update: async (id: number, body: Partial<Club>): Promise<void> => {
    if (store.demo) {
      const club = DEMO.clubs.find((item) => item.id === id);
      if (club) Object.assign(club, body);
      return;
    }
    await httpClient.json(`/api/clubs/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  addOpeningHour: async (clubId: number, body: OpeningHour): Promise<void> => {
    if (store.demo) {
      const hours = (DEMO.openingHours[clubId] = DEMO.openingHours[clubId] || []);
      hours.push([body.weekday, body.opening_hour, body.closing_hour]);
      return;
    }
    await httpClient.json(`/api/clubs/${clubId}/opening-hours/`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  updateOpeningHour: async (
    pk: number,
    clubId: number,
    body: OpeningHour,
  ): Promise<void> => {
    if (store.demo) {
      const row = DEMO.openingHours[clubId]?.find((item) => item[0] === body.weekday);
      if (row) {
        row[1] = body.opening_hour;
        row[2] = body.closing_hour;
      }
      return;
    }
    await httpClient.json(`/api/openinghours/${pk}/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  deleteOpeningHour: async (
    pk: number,
    clubId: number,
    weekday: string,
  ): Promise<void> => {
    if (store.demo) {
      const hours = DEMO.openingHours[clubId];
      const index = hours?.findIndex((row) => row[0] === weekday) ?? -1;
      if (hours && index > -1) hours.splice(index, 1);
      return;
    }
    await httpClient.json(`/api/openinghours/${pk}/`, { method: 'DELETE' });
  },
};
