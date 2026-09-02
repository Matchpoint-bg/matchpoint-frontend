import { useQueryClient } from '@tanstack/react-query';
import { queryScope } from '../../../shared/api/queryScope';
import { reservationsApi } from '../api/reservations.api';
import { reservationKeys } from './reservation.queries';
import type { CreateReservationBody, Reservation } from './reservation.types';

/**
 * The id of the reservation we just created, even when the API did not send one.
 *
 * `POST /api/reservations/` answers with a serializer that may omit it, and the
 * booking exists either way — only the deep link to it would be lost. The list
 * is the only other place the row appears, so re-read it and match on what we
 * sent. Returns `null` when even that fails; the caller then falls back to the
 * bookings list rather than pretending the booking did not happen.
 */
export function useResolveReservationId() {
  const queryClient = useQueryClient();
  const scope = queryScope();

  return async (created: Reservation | null, body: CreateReservationBody) => {
    if (created && Number.isFinite(created.id)) return created.id;
    try {
      const list = await queryClient.fetchQuery({
        queryKey: reservationKeys.list(scope),
        queryFn: reservationsApi.list,
        staleTime: 0,
      });
      const wanted = new Date(body.start_datetime).getTime();
      const match = list.find(
        (reservation) =>
          reservation.court === body.court &&
          new Date(reservation.start_datetime).getTime() === wanted,
      );
      return match?.id ?? null;
    } catch {
      return null;
    }
  };
}
