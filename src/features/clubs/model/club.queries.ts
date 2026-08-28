import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryScope } from '../../../shared/api/queryScope';
import { clubsApi } from '../api/clubs.api';
import type { Club, OpeningHour } from './club.types';

export const clubKeys = {
  all: (scope: string) => ['clubs', scope] as const,
  list: (scope: string) => [...clubKeys.all(scope), 'list'] as const,
  detail: (scope: string, clubId: number) => [...clubKeys.all(scope), 'detail', clubId] as const,
  courts: (scope: string, clubId: number) => [...clubKeys.all(scope), 'courts', clubId] as const,
  hours: (scope: string, clubId: number) => [...clubKeys.all(scope), 'hours', clubId] as const,
  employees: (scope: string, clubId: number) => [...clubKeys.all(scope), 'employees', clubId] as const,
};

export function useClubsQuery() {
  const scope = queryScope();
  return useQuery({
    queryKey: clubKeys.list(scope),
    queryFn: clubsApi.list,
    staleTime: 5 * 60_000,
  });
}

export function useClubQuery(clubId: number) {
  const scope = queryScope();
  return useQuery({
    queryKey: clubKeys.detail(scope, clubId),
    queryFn: () => (Number.isFinite(clubId) ? clubsApi.get(clubId) : Promise.resolve(null)),
    staleTime: 2 * 60_000,
  });
}

export function useClubCourtsQuery(clubId: number) {
  const scope = queryScope();
  return useQuery({
    queryKey: clubKeys.courts(scope, clubId),
    queryFn: () => (Number.isFinite(clubId) ? clubsApi.courts(clubId) : Promise.resolve([])),
    staleTime: 60_000,
  });
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
