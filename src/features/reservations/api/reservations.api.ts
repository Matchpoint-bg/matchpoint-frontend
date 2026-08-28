import { demoReservations, saveDemoReservations } from '../../../demo/demoData';
import { httpClient } from '../../../shared/api/httpClient';
import { store } from '../../../shared/storage/store';
import type {
  CreateReservationBody,
  DemoReservation,
  DemoReservationMeta,
  Reservation,
} from '../model/reservation.types';

export const reservationsApi = {
  list: async (): Promise<Reservation[]> => {
    if (store.demo) {
      return demoReservations().map((reservation) => ({
        id: reservation.id,
        court: reservation.court,
        start_datetime: reservation.start,
        end_datetime: reservation.end,
        reservation_amt: reservation.amt,
      }));
    }
    return httpClient.json<Reservation[]>('/api/reservations/');
  },

  create: async (
    body: CreateReservationBody,
    meta?: DemoReservationMeta,
  ): Promise<Reservation | null> => {
    if (store.demo) {
      const reservations = demoReservations();
      const start = new Date(body.start_datetime);
      const end = new Date(body.end_datetime);
      const slots: string[] = [];
      for (let time = new Date(start); time < end; time = new Date(time.getTime() + 30 * 60_000)) {
        slots.push(
          `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`,
        );
      }
      const reservation: DemoReservation = {
        id: Date.now(),
        court: Number(body.court),
        start: body.start_datetime,
        end: body.end_datetime,
        amt: meta?.amt ?? 0,
        date: meta?.date ?? '',
        slots,
      };
      reservations.push(reservation);
      saveDemoReservations(reservations);
      return {
        id: reservation.id,
        court: reservation.court,
        start_datetime: reservation.start,
        end_datetime: reservation.end,
        reservation_amt: reservation.amt,
      };
    }
    return httpClient.json<Reservation>('/api/reservations/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update: async (id: number, body: CreateReservationBody): Promise<void> => {
    if (store.demo) {
      const reservations = demoReservations();
      const reservation = reservations.find((item) => item.id === id);
      if (reservation) {
        Object.assign(reservation, {
          court: Number(body.court),
          start: body.start_datetime,
          end: body.end_datetime,
        });
      }
      saveDemoReservations(reservations);
      return;
    }
    await httpClient.json(`/api/reservations/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete: async (id: number): Promise<void> => {
    if (store.demo) {
      saveDemoReservations(demoReservations().filter((reservation) => reservation.id !== id));
      return;
    }
    await httpClient.json(`/api/reservations/${id}/`, { method: 'DELETE' });
  },
};
