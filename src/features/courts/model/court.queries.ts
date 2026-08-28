import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryScope } from '../../../shared/api/queryScope';
import { clubKeys } from '../../clubs/model/club.queries';
import { courtsApi } from '../api/courts.api';
import type { Court, Price, Unavailability } from './court.types';

export const courtKeys = {
  all: (scope: string) => ['courts', scope] as const,
  detail: (scope: string, courtId: number) => [...courtKeys.all(scope), 'detail', courtId] as const,
  prices: (scope: string, courtId: number) => [...courtKeys.all(scope), 'prices', courtId] as const,
  availabilityAll: (scope: string) => ['availability', scope] as const,
  availability: (scope: string, courtId: number, date: string) =>
    [...courtKeys.availabilityAll(scope), courtId, date] as const,
};

export function courtQueryOptions(courtId: number) {
  const scope = queryScope();
  return queryOptions({
    queryKey: courtKeys.detail(scope, courtId),
    queryFn: () => (Number.isFinite(courtId) ? courtsApi.get(courtId) : Promise.resolve(null)),
    staleTime: 2 * 60_000,
  });
}

export function useCourtQuery(courtId: number) {
  return useQuery(courtQueryOptions(courtId));
}

export function availabilityQueryOptions(courtId: number, date: string) {
  const scope = queryScope();
  return queryOptions({
    queryKey: courtKeys.availability(scope, courtId, date),
    queryFn: () =>
      Number.isFinite(courtId) ? courtsApi.availability(courtId, date) : Promise.resolve([]),
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useAvailabilityQuery(courtId: number, date: string) {
  return useQuery(availabilityQueryOptions(courtId, date));
}

export function useCourtPricesQuery(courtId: number) {
  const scope = queryScope();
  return useQuery({
    queryKey: courtKeys.prices(scope, courtId),
    queryFn: () => courtsApi.prices(courtId),
  });
}

function useInvalidateCourts() {
  const queryClient = useQueryClient();
  const scope = queryScope();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: courtKeys.all(scope) }),
      queryClient.invalidateQueries({ queryKey: courtKeys.availabilityAll(scope) }),
      queryClient.invalidateQueries({ queryKey: clubKeys.all(scope) }),
    ]);
  };
}

export function useSaveCourtMutation() {
  const invalidate = useInvalidateCourts();
  return useMutation({
    mutationFn: ({ court, body }: { court: Court | null; body: Partial<Court> }) =>
      court ? courtsApi.update(court.id, body) : courtsApi.create(body).then(() => undefined),
    onSuccess: invalidate,
  });
}

export function useDeleteCourtMutation() {
  const invalidate = useInvalidateCourts();
  return useMutation({
    mutationFn: courtsApi.delete,
    onSuccess: invalidate,
  });
}

export function useSetCourtPricesMutation(courtId: number) {
  const invalidate = useInvalidateCourts();
  return useMutation({
    mutationFn: (prices: Price[]) => courtsApi.setPrices(courtId, prices),
    onSuccess: invalidate,
  });
}

export function useAddUnavailabilityMutation(courtId: number) {
  const invalidate = useInvalidateCourts();
  return useMutation({
    mutationFn: (body: Unavailability) => courtsApi.addUnavailability(courtId, body),
    onSuccess: invalidate,
  });
}
