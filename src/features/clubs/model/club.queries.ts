import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryScope } from '../../../shared/api/queryScope';
import { clubsApi } from '../api/clubs.api';
import type { Club, ClubListParams, OpeningHour } from './club.types';

export const clubKeys = {
  all: (scope: string) => ['clubs', scope] as const,
  list: (scope: string, params: ClubListParams = {}) =>
    [...clubKeys.all(scope), 'list', params] as const,
  detail: (scope: string, clubId: number) => [...clubKeys.all(scope), 'detail', clubId] as const,
  courts: (scope: string, clubId: number) => [...clubKeys.all(scope), 'courts', clubId] as const,
  hours: (scope: string, clubId: number) => [...clubKeys.all(scope), 'hours', clubId] as const,
  employees: (scope: string, clubId: number) => [...clubKeys.all(scope), 'employees', clubId] as const,
};

/**
 * The club list, filtered by the API where it can be.
 *
 * `ClubFilter` resolves city, sport, surface and date server-side; anything it
 * cannot express (free-text search across address and description) stays in
 * `useClubFilters`. Passing the filters down also keeps each result set in its
 * own cache entry rather than re-filtering one shared list.
 */
export function useClubsQuery(params: ClubListParams = {}) {
  const scope = queryScope();
  return useQuery({
    queryKey: clubKeys.list(scope, params),
    queryFn: () => clubsApi.list(params),
    staleTime: 5 * 60_000,
  });
}

/**
 * Also consumed through `useQueries` when a screen resolves several clubs at
 * once (the bookings list), so it stays a shared options factory rather than
 * living inside the hook.
 */
export function clubQueryOptions(clubId: number) {
  const scope = queryScope();
  return queryOptions({
    queryKey: clubKeys.detail(scope, clubId),
    queryFn: () => (Number.isFinite(clubId) ? clubsApi.get(clubId) : Promise.resolve(null)),
    staleTime: 2 * 60_000,
  });
}

export function useClubQuery(clubId: number) {
  return useQuery(clubQueryOptions(clubId));
}

/** Shared so several clubs' courts can be resolved at once through `useQueries`. */
export function clubCourtsQueryOptions(clubId: number) {
  const scope = queryScope();
  return queryOptions({
    queryKey: clubKeys.courts(scope, clubId),
    queryFn: () => (Number.isFinite(clubId) ? clubsApi.courts(clubId) : Promise.resolve([])),
    staleTime: 60_000,
  });
}

export function useClubCourtsQuery(clubId: number) {
  return useQuery(clubCourtsQueryOptions(clubId));
}

export function useClubOpeningHoursQuery(clubId: number) {
  const scope = queryScope();
  return useQuery({
    queryKey: clubKeys.hours(scope, clubId),
    queryFn: () =>
      Number.isFinite(clubId) ? clubsApi.openingHours(clubId) : Promise.resolve([]),
    staleTime: 60_000,
  });
}

export function useClubEmployeesQuery(clubId: number) {
  const scope = queryScope();
  return useQuery({
    queryKey: clubKeys.employees(scope, clubId),
    queryFn: () => clubsApi.employees(clubId),
  });
}

function useInvalidateClubs() {
  const queryClient = useQueryClient();
  const scope = queryScope();
  return () => queryClient.invalidateQueries({ queryKey: clubKeys.all(scope) });
}

export function useUpdateClubMutation(clubId: number) {
  const invalidate = useInvalidateClubs();
  return useMutation({
    mutationFn: (body: Partial<Club>) => clubsApi.update(clubId, body),
    onSuccess: invalidate,
  });
}

export function useUploadClubImageMutation(clubId: number) {
  const invalidate = useInvalidateClubs();
  return useMutation({
    mutationFn: (file: File) => clubsApi.uploadHeaderImage(clubId, file),
    onSuccess: invalidate,
  });
}

export function useAddOpeningHourMutation(clubId: number) {
  const invalidate = useInvalidateClubs();
  return useMutation({
    mutationFn: (body: OpeningHour) => clubsApi.addOpeningHour(clubId, body),
    onSuccess: invalidate,
  });
}

interface SaveOpeningHourVariables {
  row?: OpeningHour;
  body: OpeningHour;
}

export function useSaveOpeningHourMutation(clubId: number) {
  const invalidate = useInvalidateClubs();
  return useMutation({
    mutationFn: ({ row, body }: SaveOpeningHourVariables) =>
      row?.pk !== undefined
        ? clubsApi.updateOpeningHour(row.pk, clubId, body)
        : clubsApi.addOpeningHour(clubId, body),
    onSuccess: invalidate,
  });
}

export function useDeleteOpeningHourMutation(clubId: number) {
  const invalidate = useInvalidateClubs();
  return useMutation({
    mutationFn: ({ pk, weekday }: { pk: number; weekday: string }) =>
      clubsApi.deleteOpeningHour(pk, clubId, weekday),
    onSuccess: invalidate,
  });
}
