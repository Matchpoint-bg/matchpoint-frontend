import { demoReservations, saveDemoReservations } from '../../../demo/demoData';
import { httpClient } from '../../../shared/api/httpClient';
import { currentUserId } from '../../../shared/api/session';
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
    const rows = await httpClient.json<Reservation[]>('/api/reservations/');
    // The endpoint scopes itself to the caller — except for Django-staff accounts,
    // which get every booking in the system. "My bookings" means mine either way.
    const me = currentUserId();
    return me === undefined
      ? rows
      : rows.filter((row) => row.user === undefined || row.user === me);
  },

  create: async (
    body: CreateReservationBody,
    meta?: DemoReservationMeta,
  ): Promise<Reservation | null> => {
    if (store.demo) {
      const reservations = demoReservations();
      const start = new Date(body.start_datetime);
      const end = new Date(body.end_datetime);
      const conflicts = reservations.some(
        (reservation) =>
          reservation.court === Number(body.court) &&
          new Date(reservation.start) < end &&
          new Date(reservation.end) > start,
      );
      if (conflicts) {
        throw new Error('This time was booked moments ago. Please choose another slot.');
      }
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
