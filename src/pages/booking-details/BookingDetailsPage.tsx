import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { BookingIntentCard } from '../../features/booking';
import {
  bookingCalendarEvent,
  bookingIntentFromView,
  CancelReservationModal,
  useBookingView,
  useDeleteReservationMutation,
  useReservationQuery,
} from '../../features/reservations';
import type { BookingView } from '../../features/reservations';
import { useI18n } from '../../i18n';
import { buildIcs, downloadIcs } from '../../shared/lib/calendar';
import { directionsUrl } from '../../shared/lib/maps';
import {
  BackLink,
  BookingStatus,
  Button,
  EmptyState,
  ErrorState,
  LinkButton,
  Spinner,
  useModal,
  useToast,
} from '../../shared/ui';
import styles from './BookingDetailsPage.module.css';

/**
 * One booking, in full. Reached from the bookings list and from the
 * confirmation page, and safe to bookmark — it resolves from the reservations
 * list, which is fetched fresh on every visit.
 */
export function BookingDetailsPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { t } = useI18n();
  const { openModal, closeModal } = useModal();
  const { toast } = useToast();
  const reservationQuery = useReservationQuery(id);
  const { view } = useBookingView(reservationQuery.reservation);
  const deleteReservation = useDeleteReservationMutation();

  const backToList = () => navigate('/reservations');

  if (reservationQuery.isPending) {
    return (
      <AppShell active="reservations">
        <Spinner />
      </AppShell>
    );
  }

  if (reservationQuery.error) {
    return (
      <AppShell active="reservations">
        <ErrorState msg={reservationQuery.error.message} onRetry={reservationQuery.refetch} />
      </AppShell>
    );
  }

  if (!view) {
    return (
      <AppShell active="reservations">
        <BackLink label={t('my_reservations')} onClick={backToList} />
        <EmptyState
          title={t('booking_not_found_title')}
          desc={t('booking_not_found_desc')}
          icon="ticket"
        >
          <Button onClick={backToList}>{t('my_reservations')}</Button>
        </EmptyState>
      </AppShell>
    );
  }

  const upcoming = view.status === 'confirmed';
  const directions = directionsUrl({
    address: view.clubAddress,
    name: view.clubName,
    ...(view.latitude !== undefined ? { latitude: view.latitude } : {}),
    ...(view.longitude !== undefined ? { longitude: view.longitude } : {}),
  });

  const addToCalendar = () =>
    downloadIcs(
      `${view.reference}.ics`,
      buildIcs(bookingCalendarEvent(view, { referenceLabel: t('booking_reference') })),
    );

  const askCancel = (booking: BookingView) =>
    openModal(
      t('cancel_title'),
      <CancelReservationModal
        view={booking}
        onKeep={closeModal}
        onConfirm={async () => {
          try {
            await deleteReservation.mutateAsync(booking.id);
            toast(t('cancelled_toast'), 'ok');
            closeModal();
            navigate('/reservations', { replace: true });
          } catch (error) {
            toast(error instanceof Error ? error.message : String(error), 'err');
          }
        }}
      />,
    );

  return (
    <AppShell active="reservations">
      <BackLink label={t('my_reservations')} onClick={backToList} />

      <header className={styles.header}>
        <span className="eyebrow">{t('booking_details_eyebrow')}</span>
        <h1>{t('booking_details_title')}</h1>
        <div className={styles.reference}>
          <span>
            {t('booking_reference')}: <strong>{view.reference}</strong>
          </span>
          <BookingStatus status={view.status} />
        </div>
      </header>

      <BookingIntentCard intent={bookingIntentFromView(view)} />

      <div className={styles.actions}>
        <LinkButton
          href={directions}
          target="_blank"
          rel="noreferrer"
          variant="outline"
          icon="pin"
        >
          {t('club_directions')}
        </LinkButton>
        {upcoming && (
          <>
            <Button variant="outline" icon="calendar" onClick={addToCalendar}>
              {t('add_to_calendar')}
            </Button>
            <Button
              variant="outline"
              icon="clock"
              disabled={view.clubId === null}
              onClick={() => navigate(`/clubs/${view.clubId}?date=${view.date}&reschedule=${view.id}`)}
            >
              {t('reschedule')}
            </Button>
            <Button variant="danger" icon="trash" onClick={() => askCancel(view)}>
              {t('cancel_booking')}
            </Button>
          </>
        )}
      </div>
    </AppShell>
  );
}
