import { useQuery } from '@tanstack/react-query';
import { queryScope } from '../../../shared/api/queryScope';
import { courtKeys } from '../../courts';
import { availabilityApi } from '../api/availability.api';

export function useClubAvailabilityQuery(clubId: number, date: string) {
  const scope = queryScope();
  return useQuery({
    queryKey: [...courtKeys.availabilityAll(scope), 'club', clubId, date],
    queryFn: () => availabilityApi.club(clubId, date),
    enabled: Number.isFinite(clubId) && Boolean(date),
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
