import { DEMO, demoAvailability } from '../../../demo/demoData';
import { httpClient } from '../../../shared/api/httpClient';
import { store } from '../../../shared/storage/store';
import type { Court, Price, Slot, Unavailability } from '../model/court.types';

export const courtsApi = {
  get: async (id: number): Promise<Court | null> =>
    store.demo
      ? (DEMO.courts.find((court) => court.id === id) ?? null)
      : httpClient.json<Court>(`/api/courts/${id}/`),

  availability: async (id: number, date: string): Promise<Slot[]> =>
    store.demo
      ? demoAvailability(id, date)
      : httpClient.json<Slot[]>(`/api/courts/${id}/availabilities/?date=${date}`),

  prices: async (id: number): Promise<Price[]> => {
    if (store.demo) {
      const court = DEMO.courts.find((item) => item.id === id);
      const base = court?.is_indoor ? 9 : 7;
      return [
        { weekday: 'All', time_start: '08:00', time_end: '18:00', price_per_30_minutes: base },
        { weekday: 'All', time_start: '18:00', time_end: '22:00', price_per_30_minutes: base + 4 },
      ];
    }
    return httpClient.json<Price[]>(`/api/courts/${id}/prices/`);
  },

  setPrices: async (id: number, prices: Price[]): Promise<void> => {
    if (store.demo) return;
    await httpClient.json(`/api/courts/${id}/prices/`, {
      method: 'PUT',
      body: JSON.stringify(prices),
    });
  },

  unavailabilities: async (id: number): Promise<Unavailability[]> =>
    store.demo
      ? []
      : httpClient.json<Unavailability[]>(`/api/courts/${id}/unavailabilities/`),

  addUnavailability: async (id: number, body: Unavailability): Promise<void> => {
    if (store.demo) return;
    await httpClient.json(`/api/courts/${id}/unavailabilities/`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  create: async (body: Partial<Court>): Promise<{ id: number }> => {
    if (store.demo) {
      const id = Math.max(...DEMO.courts.map((court) => court.id)) + 1;
      DEMO.courts.push({ ...(body as Court), id });
      return { id };
    }
    return httpClient.json<{ id: number }>('/api/courts/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update: async (id: number, body: Partial<Court>): Promise<void> => {
    if (store.demo) {
      const court = DEMO.courts.find((item) => item.id === id);
      if (court) Object.assign(court, body);
      return;
    }
    await httpClient.json(`/api/courts/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete: async (id: number): Promise<void> => {
    if (store.demo) {
      const index = DEMO.courts.findIndex((court) => court.id === id);
      if (index > -1) DEMO.courts.splice(index, 1);
      return;
    }
    await httpClient.json(`/api/courts/${id}/`, { method: 'DELETE' });
  },
};
