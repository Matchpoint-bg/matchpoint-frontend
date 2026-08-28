import { useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { useAuth } from '../../features/auth';
import {
  CancelReservationModal,
  ReservationGroup,
  useDeleteReservationMutation,
  useReservationOverview,
} from '../../features/reservations';
import type { Reservation } from '../../features/reservations';
import { useI18n } from '../../i18n';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { Icon } from '../../shared/ui/Icon';
import { useModal } from '../../shared/ui/Modal';
import { SectionHeader } from '../../shared/ui/SectionHeader';
import { Spinner } from '../../shared/ui/Spinner';
import { useToast } from '../../shared/ui/Toast';
import styles from './ReservationsPage.module.css';

interface HighlightState {
  highlight?: { id: number | null; start: string | null };
}

export function ReservationsPage() {
  const { t } = useI18n();
  const { isStaff } = useAuth();
  const { openModal, closeModal } = useModal();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const deleteReservation = useDeleteReservationMutation();
  const overview = useReservationOverview();
  const highlight = (location.state as HighlightState | null)?.highlight ?? null;

  const courtLabel = (reservation: Reservation) =>
    overview.courtNames.get(reservation.court) ??
    `${t('tennis_court')} #${reservation.court}`;

  const isHighlighted = (reservation: Reservation) =>
    highlight !== null &&
    ((highlight.id !== null && reservation.id === highlight.id) ||
      (highlight.start !== null && reservation.start_datetime === highlight.start));

  function askCancel(reservation: Reservation) {
    openModal(
      t('cancel_title'),
      <CancelReservationModal
        reservation={reservation}
        courtLabel={courtLabel(reservation)}
        onKeep={closeModal}
        onConfirm={async () => {
          try {
            await deleteReservation.mutateAsync(reservation.id);
            toast(t('cancelled_toast'), 'ok');
            closeModal();
          } catch (error) {
            toast(error instanceof Error ? error.message : String(error), 'err');
          }
        }}
      />,
    );
  }

  const goReschedule = (reservation: Reservation) =>
    navigate(`/courts/${reservation.court}?reschedule=${reservation.id}`);

  return (
    <AppShell active="reservations">
      <SectionHeader
        eyebrow={t('reservations_eyebrow')}
        title={t('reservations_h2')}
        {...(isStaff ? { sub: t('staff_res_note') } : {})}
      >
        <button className="btn btn--soft btn--sm" onClick={() => navigate('/clubs')}>
          <Icon name="plus" />
          {t('book_more')}
        </button>
      </SectionHeader>

      {overview.loading && <Spinner />}
      {!overview.loading && overview.error && (
        <ErrorState msg={overview.error.message} onRetry={overview.reload} />
      )}

      {!overview.loading && !overview.error && overview.reservations.length === 0 && (
        <EmptyState title={t('no_res_title')} desc={t('no_res_desc')} icon="ticket">
          <button
            className={`btn btn--primary ${styles.emptyAction}`}
            onClick={() => navigate('/clubs')}
          >
            <Icon name="ball" />
            {t('find_court')}
          </button>
        </EmptyState>
      )}

      {!overview.loading && !overview.error && (
        <>
          <ReservationGroup
            label={t('upcoming')}
            reservations={overview.upcoming}
            upcoming
            courtLabel={courtLabel}
            isHighlighted={isHighlighted}
            onCancel={askCancel}
            onReschedule={goReschedule}
          />
          <ReservationGroup
            label={t('past')}
            reservations={overview.past}
            upcoming={false}
            courtLabel={courtLabel}
            isHighlighted={isHighlighted}
            onCancel={askCancel}
            onReschedule={goReschedule}
          />
        </>
      )}
    </AppShell>
  );
}
