import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useI18n } from '../../../i18n';
import { fmt } from '../../../shared/lib/format';
import { bookingIntentStore } from '../../booking/model/bookingIntent.store';
import { clubQueryOptions } from '../../clubs/model/club.queries';
import type { Club } from '../../clubs/model/club.types';
import { courtQueryOptions } from '../../courts/model/court.queries';
import type { Court } from '../../courts/model/court.types';
import { bookingReference } from './bookingReference';
import type { BookingView } from './bookingView.types';
import type { Reservation } from './reservation.types';
import { reservationStatus } from './reservationStatus';

/**
 * Resolves reservations into full `BookingView`s.
 *
 * Two waves of queries, each over *distinct* ids — reservations share courts
 * and courts share clubs, so a list of ten bookings at one club costs two
 * requests, not twenty. Both waves reuse the same options factories (and so the
 * same cache entries) as the club and court pages.
 *
 * Where a value exists in two places, the confirmation snapshot in
 * sessionStorage wins: it is what the player was actually quoted, and it paints
 * without waiting for a request.
 */
export function useBookingViews(reservations: Reservation[]) {
  const { t } = useI18n();

  const courtIds = useMemo(
    () => [...new Set(reservations.map((reservation) => reservation.court))],
    [reservations],
  );
  const courtQueries = useQueries({ queries: courtIds.map(courtQueryOptions) });

  const courts = useMemo(() => {
    const map = new Map<number, Court>();
    courtIds.forEach((id, index) => {
      const court = courtQueries[index]?.data;
      if (court) map.set(id, court);
    });
    return map;
    // Query results are new array identities every render; the ids they carry
    // are what actually changes.
  }, [courtIds, courtQueries.map((query) => query.data?.id ?? 0).join(',')]);

  const clubIds = useMemo(
    () => [
      ...new Set(
        [...courts.values()]
          .map((court) => court.club_id)
          .filter((clubId): clubId is number => Number.isFinite(clubId)),
      ),
    ],
    [courts],
  );
  const clubQueries = useQueries({ queries: clubIds.map(clubQueryOptions) });

  const clubs = useMemo(() => {
    const map = new Map<number, Club>();
    clubIds.forEach((id, index) => {
      const club = clubQueries[index]?.data;
      if (club) map.set(id, club);
    });
    return map;
  }, [clubIds, clubQueries.map((query) => query.data?.id ?? 0).join(',')]);

  const views = useMemo<BookingView[]>(() => {
    const now = Date.now();
    return reservations.map((reservation) => {
      const court = courts.get(reservation.court);
      const clubId = Number.isFinite(court?.club_id) ? (court?.club_id as number) : null;
      const club = clubId === null ? undefined : clubs.get(clubId);
      const snapshot = bookingIntentStore.confirmation(reservation.id);
      const start = new Date(reservation.start_datetime);
      const end = new Date(reservation.end_datetime);
      const address = [club?.address, club?.city].filter(Boolean).join(', ');
      const price = reservation.reservation_amt ?? snapshot?.quotedPrice ?? null;

      return {
        id: reservation.id,
        reservation,
        status: reservationStatus(reservation, now),
        reference: snapshot?.bookingReference ?? bookingReference(reservation.id),
        clubId: clubId ?? (snapshot ? snapshot.clubId : null),
        clubName: club?.name ?? snapshot?.clubName ?? t('tennis_club'),
        clubAddress: address || (snapshot?.clubAddress ?? ''),
        courtId: reservation.court,
        courtName:
          court?.name ?? snapshot?.courtName ?? `${t('tennis_court')} #${reservation.court}`,
        surface: court?.surface_type ?? snapshot?.surface ?? '',
        date: fmt.isoDate(start),
        start: reservation.start_datetime,
        end: reservation.end_datetime,
        durationMinutes: Math.round((end.getTime() - start.getTime()) / 60_000),
        price: Number.isFinite(price) ? (price as number) : null,
        currency: 'BGN',
        cancellationPolicy:
          club?.cancellation_policy ||
          snapshot?.cancellationPolicy ||
          t('cancellation_policy_default'),
        ...(Number.isFinite(club?.latitude) ? { latitude: club?.latitude } : {}),
        ...(Number.isFinite(club?.longitude) ? { longitude: club?.longitude } : {}),
        resolved: court !== undefined,
      };
    });
  }, [reservations, courts, clubs, t]);

  const byId = useMemo(() => new Map(views.map((view) => [view.id, view])), [views]);

  return {
    views,
    byId,
    loading:
      courtQueries.some((query) => query.isPending) || clubQueries.some((query) => query.isPending),
    error:
      courtQueries.find((query) => query.error)?.error ??
      clubQueries.find((query) => query.error)?.error ??
      null,
  };
}

/** One booking, same resolution rules. */
export function useBookingView(reservation: Reservation | null | undefined) {
  const list = useMemo(() => (reservation ? [reservation] : []), [reservation]);
  const { views, loading, error } = useBookingViews(list);
  return { view: views[0] ?? null, loading, error };
}
