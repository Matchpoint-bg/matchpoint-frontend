import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { BookingIntentCard, bookingIntentStore } from '../../features/booking';
import {
  bookingCalendarEvent,
  bookingIntentFromView,
  bookingViewFromSnapshot,
  useBookingView,
  useReservationQuery,
} from '../../features/reservations';
import { useI18n } from '../../i18n';
import { buildIcs, downloadIcs } from '../../shared/lib/calendar';
import { directionsUrl } from '../../shared/lib/maps';
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
  const reservationQuery = useReservationQuery(id);
  const { view: resolved } = useBookingView(reservationQuery.reservation);
  const view = resolved ?? (snapshot ? bookingViewFromSnapshot(snapshot) : null);
  const rescheduled = snapshot?.rescheduleOf !== undefined;

  if (!view && reservationQuery.isPending) {
    return (
      <AppShell active="reservations">
        <Spinner />
      </AppShell>
    );
  }

  if (!view && reservationQuery.error) {
    return (
      <AppShell active="reservations">
        <ErrorState msg={reservationQuery.error.message} onRetry={reservationQuery.refetch} />
      </AppShell>
    );
  }

  if (!view) {
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

  const directions = directionsUrl({
    address: view.clubAddress,
    name: view.clubName,
    ...(view.latitude !== undefined ? { latitude: view.latitude } : {}),
    ...(view.longitude !== undefined ? { longitude: view.longitude } : {}),
  });

  // Built by `shared/lib/calendar`, which escapes the commas and semicolons an
  // address is full of and folds long lines — an inline template does neither.
  const addToCalendar = () =>
    downloadIcs(
      `${view.reference}.ics`,
      buildIcs(bookingCalendarEvent(view, { referenceLabel: t('booking_reference') })),
    );

  return (
    <AppShell active="reservations">
      <header className={styles.success}>
        <span className={styles.icon}><Icon name="check" /></span>
        <div>
          <span className="eyebrow">
            {rescheduled ? t('reschedule_confirmed_eyebrow') : t('confirmation_eyebrow')}
          </span>
          <h1>{rescheduled ? t('reschedule_confirmed_title') : t('confirmation_title')}</h1>
          <div className={styles.reference}>
            <span>{t('booking_reference')}: <strong>{view.reference}</strong></span>
            <StatusBadge label={t('status_confirmed')} tone="success" />
          </div>
        </div>
      </header>

      <BookingIntentCard intent={bookingIntentFromView(view)} />

      <div className={styles.actions}>
        <Button icon="calendar" onClick={addToCalendar}>
          {t('add_to_calendar')}
        </Button>
        <LinkButton href={directions} target="_blank" rel="noreferrer" variant="outline" icon="pin">
          {t('club_directions')}
        </LinkButton>
        <LinkButton to={`/reservations?new=${view.id}`} variant="outline" icon="ticket">
          {t('my_reservations')}
        </LinkButton>
      </div>
    </AppShell>
  );
}
