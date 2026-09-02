import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { BookingIntentCard, bookingIntentStore } from '../../features/booking';
import type { BookingIntent } from '../../features/booking';
import { useClubQuery } from '../../features/clubs';
import { useCourtQuery } from '../../features/courts';
import { useReservationsQuery } from '../../features/reservations';
import { useI18n } from '../../i18n';
import { buildIcs, downloadIcs } from '../../shared/lib/calendar';
import { fmt } from '../../shared/lib/format';
import {
  Button,
  EmptyState,
  ErrorState,
  Icon,
  LinkButton,
  Spinner,
  StatusBadge,
} from '../../shared/ui';
import styles from './BookingConfirmationPage.module.css';

export function BookingConfirmationPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { t } = useI18n();

  // Two sources, deliberately: the sessionStorage snapshot paints instantly for
  // the player who just booked, and the API keeps the page true for every other
  // visit — a reload, another tab, a bookmark opened tomorrow.
  const snapshot = useMemo(() => bookingIntentStore.confirmation(id), [id]);
  const reservationsQuery = useReservationsQuery();
  const reservation = (reservationsQuery.data ?? []).find((item) => item.id === id);
  const courtQuery = useCourtQuery(reservation?.court ?? Number.NaN);
  const court = courtQuery.data;
  const clubQuery = useClubQuery(court?.club_id ?? Number.NaN);
  const club = clubQuery.data;

  // What the booking looks like once the snapshot is gone. The reservation
  // carries the times and the price; club and court names come from their own
  // queries, each falling back to something honest while it loads.
  const rebuilt = useMemo<BookingIntent | null>(() => {
    if (!reservation) return null;
    const start = new Date(reservation.start_datetime);
    const end = new Date(reservation.end_datetime);
    return {
      version: 1,
      clubId: club?.id ?? Number.NaN,
      clubName: club?.name ?? t('tennis_club'),
      clubAddress: [club?.address, club?.city].filter(Boolean).join(', '),
      courtId: reservation.court,
      courtName: court?.name ?? `${t('tennis_court')} #${reservation.court}`,
      surface: court?.surface_type ?? '',
      date: fmt.isoDate(start),
      start: reservation.start_datetime,
      end: reservation.end_datetime,
      durationMinutes: Math.round((end.getTime() - start.getTime()) / 60_000),
      // NaN, not 0: a price the API did not send is unknown, not free.
      quotedPrice: reservation.reservation_amt ?? Number.NaN,
      currency: 'BGN',
      cancellationPolicy: t('cancellation_policy_default'),
      paymentMethod: 'pay_on_site',
      createdAt: reservation.start_datetime,
    };
  }, [club, court, reservation, t]);

  const intent = snapshot ?? rebuilt;

  if (!intent && reservationsQuery.isPending) {
    return (
      <AppShell active="reservations">
        <Spinner />
      </AppShell>
    );
  }

  if (!intent && reservationsQuery.error) {
    return (
      <AppShell active="reservations">
        <ErrorState
          msg={reservationsQuery.error.message}
          onRetry={() => void reservationsQuery.refetch()}
        />
      </AppShell>
    );
  }

  if (!intent) {
    return (
      <AppShell active="reservations">
        <EmptyState
          title={t('confirmation_missing_title')}
          desc={t('confirmation_missing_desc')}
          icon="ticket"
        >
          <Button onClick={() => navigate('/reservations')}>{t('my_reservations')}</Button>
        </EmptyState>
      </AppShell>
    );
  }

  const reference = snapshot?.bookingReference ?? `MP-${id}`;
  const destination = intent.clubAddress || intent.clubName;
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;

  // Built by `shared/lib/calendar`, which escapes the commas and semicolons an
  // address is full of and folds long lines — an inline template does neither.
  const addToCalendar = () =>
    downloadIcs(
      `${reference}.ics`,
      buildIcs({
        uid: `${reference}@matchpoint.bg`,
        title: `${intent.courtName} · ${intent.clubName}`,
        location: destination,
        description: `${t('booking_reference')}: ${reference}`,
        start: new Date(intent.start),
        end: new Date(intent.end),
      }),
    );

  return (
    <AppShell active="reservations">
      <header className={styles.success}>
        <span className={styles.icon}><Icon name="check" /></span>
        <div>
          <span className="eyebrow">{t('confirmation_eyebrow')}</span>
          <h1>{t('confirmation_title')}</h1>
          <div className={styles.reference}>
            <span>{t('booking_reference')}: <strong>{reference}</strong></span>
            <StatusBadge label={t('status_confirmed')} tone="success" />
          </div>
        </div>
      </header>

      <BookingIntentCard intent={intent} />

      <div className={styles.actions}>
        <Button icon="calendar" onClick={addToCalendar}>
          {t('add_to_calendar')}
        </Button>
        <LinkButton href={directions} target="_blank" rel="noreferrer" variant="outline" icon="pin">
          {t('club_directions')}
        </LinkButton>
        <LinkButton to="/reservations" variant="outline" icon="ticket">
          {t('my_reservations')}
        </LinkButton>
      </div>
    </AppShell>
  );
}
