import { useLocation, useParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { mapsDirectionsUrl, useClubQuery } from '../../features/clubs';
import { useCourtQuery } from '../../features/courts';
import { bookingReference, useReservationsQuery } from '../../features/reservations';
import { useI18n } from '../../i18n';
import { buildIcs, downloadIcs } from '../../shared/lib/calendar';
import { fmt } from '../../shared/lib/format';
import {
  BookingStatus,
  Button,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  ErrorState,
  Icon,
  LinkButton,
  Spinner,
  SurfaceBadge,
} from '../../shared/ui';
import styles from './BookingConfirmationPage.module.css';

/** Handed over by the confirm step; absent on a cold load of the URL. */
interface ConfirmationState {
  price?: number | null;
  clubId?: number | null;
}

/**
 * Where a booking ends (ToDoRedesign §11).
 *
 * The id in the URL is the only input — everything shown is re-read from the
 * API — so this page can be refreshed, bookmarked or opened days later and
 * still tells the truth. Nothing here writes; arriving twice books nothing.
 */
export function BookingConfirmationPage() {
  const { id } = useParams();
  const reservationId = Number(id);
  const { t, lang } = useI18n();
  const { state } = useLocation();
  const handoff = (state ?? null) as ConfirmationState | null;

  const reservationsQuery = useReservationsQuery();
  const reservation = (reservationsQuery.data ?? []).find(
    (item) => item.id === reservationId,
  );

  const courtQuery = useCourtQuery(reservation?.court ?? Number.NaN);
  const court = courtQuery.data;
  // The club comes with the intent when the player has just booked; on a cold
  // load the court is the only route to it, and the live API may not carry it.
  const clubId = handoff?.clubId ?? court?.club_id ?? Number.NaN;
  const clubQuery = useClubQuery(clubId);
  const club = clubQuery.data;

  if (reservationsQuery.isPending) {
    return (
      <AppShell active="reservations">
        <Spinner />
      </AppShell>
    );
  }

  if (reservationsQuery.error) {
    return (
      <AppShell active="reservations">
        <ErrorState
          msg={reservationsQuery.error.message}
          onRetry={() => void reservationsQuery.refetch()}
        />
      </AppShell>
    );
  }

  if (!reservation) {
    return (
      <AppShell active="reservations">
        <EmptyState title={t('booking_missing_title')} desc={t('booking_missing_desc')} icon="ticket">
          <LinkButton to="/reservations" variant="primary" icon="ticket">
            {t('my_reservations')}
          </LinkButton>
        </EmptyState>
      </AppShell>
    );
  }

  const start = new Date(reservation.start_datetime);
  const end = new Date(reservation.end_datetime);
  const minutes = Math.round((end.getTime() - start.getTime()) / 60_000);
  const played = end.getTime() < Date.now();
  const price = reservation.reservation_amt ?? handoff?.price ?? null;
  const courtName = court?.name ?? `${t('tennis_court')} #${reservation.court}`;
  const clubName = club?.name ?? t('tennis_club');
  const address = [club?.address, club?.city].filter(Boolean).join(', ');
  const reference = bookingReference(reservation.id);
  const directions = club ? mapsDirectionsUrl(club) : null;

  const addToCalendar = () => {
    downloadIcs(
      `matchpoint-${reference}.ics`,
      buildIcs({
        uid: `${reference}@matchpoint.bg`,
        title: `${courtName} · ${clubName}`,
        location: address || clubName,
        description: [
          `${t('booking_reference')}: ${reference}`,
          price !== null ? `${t('review_total')}: ${fmt.money(price)}` : null,
          t('pay_at_club'),
        ]
          .filter(Boolean)
          .join('\n'),
        start,
        end,
      }),
    );
  };

  return (
    <AppShell active="reservations">
      <Card className={styles.success}>
        <span className={styles.tick} aria-hidden="true">
          <Icon name="check" />
        </span>
        <div className={styles.successCopy}>
          <span className="eyebrow">{t('confirmation_eyebrow')}</span>
          <h1>{t('confirmation_title')}</h1>
          <p>{played ? t('confirmation_past_sub') : t('confirmation_sub')}</p>
        </div>
        <div className={styles.reference}>
          <BookingStatus status={played ? 'completed' : 'confirmed'} />
          <span>
            <small>{t('booking_reference')}</small>
            <b>{reference}</b>
          </span>
        </div>
      </Card>

      <Card className={styles.card}>
        <h2 className={styles.clubName}>{clubName}</h2>
        {address && <p className={styles.address}>{address}</p>}

        <ChipRow>
          <Chip variant="ghost" icon="court">{courtName}</Chip>
          {court && <SurfaceBadge surface={court.surface_type} />}
          {court && (
            <Chip variant={court.is_indoor ? 'indoor' : 'ghost'} icon={court.is_indoor ? 'indoor' : 'sun'}>
              {court.is_indoor ? t('indoor') : t('outdoor')}
            </Chip>
          )}
        </ChipRow>

        <dl className={styles.rows}>
          <div>
            <dt>{t('review_when')}</dt>
            <dd>
              {fmt.dateLong(reservation.start_datetime, lang)} ·{' '}
              {fmt.time(reservation.start_datetime)} – {fmt.time(reservation.end_datetime)}
            </dd>
          </div>
          <div>
            <dt>{t('review_duration')}</dt>
            <dd>{minutes} {t('minutes_short')}</dd>
          </div>
          <div>
            <dt>{t('payment_method')}</dt>
            <dd>
              {t('pay_at_club')}
              <small>{played ? t('pay_at_club_note') : t('payment_due_at_club')}</small>
            </dd>
          </div>
          <div>
            <dt>{t('cancellation_policy')}</dt>
            <dd>
              {t('cancellation_default')}
              <small>{t('cancellation_default_note')}</small>
            </dd>
          </div>
        </dl>

        {price !== null && (
          <div className={styles.total}>
            <span>{t('review_total')}</span>
            <b>{fmt.money(price)}</b>
          </div>
        )}
      </Card>

      <div className={styles.actions}>
        <Button variant="primary" icon="calendar" onClick={addToCalendar}>
          {t('add_to_calendar')}
        </Button>
        {directions && (
          <LinkButton
            variant="outline"
            icon="pin"
            href={directions}
            target="_blank"
            rel="noreferrer"
          >
            {t('directions')}
          </LinkButton>
        )}
        <LinkButton variant="ghost" icon="ticket" to="/reservations">
          {t('my_reservations')}
        </LinkButton>
      </div>

      {(club?.phone || club?.email) && (
        <Card className={styles.support}>
          <div>
            <b>{t('confirmation_help_title')}</b>
            <p>{t('confirmation_help_desc')}</p>
          </div>
          <div className={styles.supportLinks}>
            {club.phone && (
              <a href={`tel:${club.phone}`}>
                <Icon name="phone" />
                {club.phone}
              </a>
            )}
            {club.email && (
              <a href={`mailto:${club.email}`}>
                <Icon name="mail" />
                {club.email}
              </a>
            )}
          </div>
        </Card>
      )}
    </AppShell>
  );
}
