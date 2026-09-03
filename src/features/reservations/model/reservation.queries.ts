import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryScope } from '../../../shared/api/queryScope';
import { courtKeys } from '../../courts/model/court.queries';
import { reservationsApi } from '../api/reservations.api';
import type {
  CreateReservationBody,
  DemoReservationMeta,
} from './reservation.types';

export const reservationKeys = {
  all: (scope: string) => ['reservations', scope] as const,
  list: (scope: string) => [...reservationKeys.all(scope), 'list'] as const,
};

export function useReservationsQuery() {
  const scope = queryScope();
  return useQuery({
    queryKey: reservationKeys.list(scope),
    queryFn: reservationsApi.list,
    staleTime: 0,
  });
}

/**
 * One booking, read out of the list.
 *
 * The API has no detail endpoint (§15), and the list is small, user-scoped and
 * never stale (`staleTime: 0`), so a deep link costs the same single request a
 * detail endpoint would.
 */
export function useReservationQuery(id: number) {
  const query = useReservationsQuery();
  const reservation = useMemo(
    () => (query.data ?? []).find((item) => item.id === id) ?? null,
    [query.data, id],
  );
  return {
    reservation,
    isPending: query.isPending,
    error: query.error,
    refetch: () => void query.refetch(),
  };
}

function useInvalidateReservations() {
  const queryClient = useQueryClient();
  const scope = queryScope();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: reservationKeys.all(scope) }),
      queryClient.invalidateQueries({ queryKey: courtKeys.availabilityAll(scope) }),
    ]);
  };
}

export function useCreateReservationMutation() {
  const invalidate = useInvalidateReservations();
  return useMutation({
    mutationFn: ({ body, meta }: { body: CreateReservationBody; meta?: DemoReservationMeta }) =>
      reservationsApi.create(body, meta),
    onSuccess: invalidate,
  });
}

export function useUpdateReservationMutation() {
  const invalidate = useInvalidateReservations();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: CreateReservationBody }) =>
      reservationsApi.update(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteReservationMutation() {
  const invalidate = useInvalidateReservations();
  return useMutation({
    mutationFn: reservationsApi.delete,
    onSuccess: invalidate,
  });
}
