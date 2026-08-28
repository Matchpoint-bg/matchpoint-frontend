import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
