import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { courtQueryOptions } from '../../courts/model/court.queries';
import { useReservationsQuery } from './reservation.queries';
import { partitionReservations } from './reservationStatus';

export function useReservationOverview() {
  const reservationsQuery = useReservationsQuery();
  const reservations = useMemo(
    () =>
      (reservationsQuery.data ?? [])
        .slice()
        .sort(
          (left, right) =>
            new Date(left.start_datetime).getTime() - new Date(right.start_datetime).getTime(),
        ),
    [reservationsQuery.data],
  );
  const courtIds = useMemo(
    () => [...new Set(reservations.map((reservation) => reservation.court))],
    [reservations],
  );
  const courtQueries = useQueries({ queries: courtIds.map(courtQueryOptions) });
  const courtNames = new Map<number, string>();

  courtIds.forEach((id, index) => {
    const name = courtQueries[index]?.data?.name;
    if (name) courtNames.set(id, name);
  });

  const { upcoming, past } = partitionReservations(reservations);

  return {
    reservations,
    upcoming,
    past,
    courtNames,
    loading: reservationsQuery.isPending || courtQueries.some((query) => query.isPending),
    error: reservationsQuery.error ?? courtQueries.find((query) => query.error)?.error ?? null,
    reload: () => {
      void reservationsQuery.refetch();
      courtQueries.forEach((query) => void query.refetch());
    },
  };
}
