import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { useAuth } from '../../features/auth';
import {
  BookingList,
  CancelReservationModal,
  useBookingViews,
  useDeleteReservationMutation,
  useReservationOverview,
} from '../../features/reservations';
import type { BookingView } from '../../features/reservations';
import { useI18n } from '../../i18n';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { Icon } from '../../shared/ui/Icon';
import { useModal } from '../../shared/ui/Modal';
import { SectionHeader } from '../../shared/ui/SectionHeader';
import { Spinner } from '../../shared/ui/Spinner';
import { Tabs } from '../../shared/ui/Tabs';
import { useToast } from '../../shared/ui/Toast';
import styles from './ReservationsPage.module.css';

type BookingsTab = 'upcoming' | 'past';

export function ReservationsPage() {
  const { t } = useI18n();
  const { isStaff } = useAuth();
  const { openModal, closeModal } = useModal();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const deleteReservation = useDeleteReservationMutation();
  const overview = useReservationOverview();
  const { byId } = useBookingViews(overview.reservations);

  // The tab lives in the URL: it survives a refresh, and a player can send
  // someone "my past bookings" as a link.
  const tab: BookingsTab = searchParams.get('tab') === 'past' ? 'past' : 'upcoming';
  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', next);
    setSearchParams(params, { replace: true });
  };

  const newBookingId = Number(searchParams.get('new'));
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const newBooking =
    !bannerDismissed && Number.isFinite(newBookingId) ? (byId.get(newBookingId) ?? null) : null;

  const upcomingViews = useMemo(
    () => overview.upcoming.map((reservation) => byId.get(reservation.id)).filter(Boolean),
    [overview.upcoming, byId],
  ) as BookingView[];
  // History reads newest first; the schedule reads soonest first.
  const pastViews = useMemo(
    () =>
      overview.past
        .map((reservation) => byId.get(reservation.id))
        .filter(Boolean)
        .reverse(),
    [overview.past, byId],
  ) as BookingView[];

  const openBooking = (view: BookingView) => navigate(`/reservations/${view.id}`);

  const goReschedule = (view: BookingView) =>
    navigate(`/clubs/${view.clubId}?date=${view.date}&reschedule=${view.id}`);

  function askCancel(view: BookingView) {
    openModal(
      t('cancel_title'),
      <CancelReservationModal
        view={view}
        onKeep={closeModal}
        onConfirm={async () => {
          try {
            await deleteReservation.mutateAsync(view.id);
            toast(t('cancelled_toast'), 'ok');
            closeModal();
          } catch (error) {
            toast(error instanceof Error ? error.message : String(error), 'err');
          }
        }}
      />,
    );
  }

  const listProps = {
    onView: openBooking,
    onCancel: askCancel,
    onReschedule: goReschedule,
  };

  return (
    <AppShell active="reservations">
      <SectionHeader
        eyebrow={t('reservations_eyebrow')}
        title={t('reservations_h2')}
        {...(isStaff ? { sub: t('staff_res_note') } : {})}
      >
        <button className="btn btn--soft btn--sm" onClick={() => navigate('/players')}>
          <Icon name="plus" />
          {t('book_more')}
        </button>
      </SectionHeader>

      {newBooking && (
        <div className={styles.banner} role="status">
          <Icon name="check" />
          <p>
            <b>{t('booking_confirmed_banner')}</b> · {newBooking.reference}
          </p>
          <button className="btn btn--soft btn--sm" onClick={() => openBooking(newBooking)}>
            {t('view_booking')}
          </button>
          <button
            className={styles.dismiss}
            aria-label={t('dismiss')}
            onClick={() => setBannerDismissed(true)}
          >
            <Icon name="x" />
          </button>
        </div>
      )}

      {overview.loading && <Spinner />}
      {!overview.loading && overview.error && (
        <ErrorState msg={overview.error.message} onRetry={overview.reload} />
      )}

      {!overview.loading && !overview.error && overview.reservations.length === 0 && (
        <EmptyState title={t('no_res_title')} desc={t('no_res_desc')} icon="ticket">
          <button
            className={`btn btn--primary ${styles.emptyAction}`}
            onClick={() => navigate('/players')}
          >
            <Icon name="ball" />
            {t('find_court')}
          </button>
        </EmptyState>
      )}

      {!overview.loading && !overview.error && overview.reservations.length > 0 && (
        <>
          <Tabs
            items={[
              { value: 'upcoming', label: `${t('upcoming')} (${upcomingViews.length})` },
              { value: 'past', label: `${t('past')} (${pastViews.length})` },
            ]}
            value={tab}
            onChange={setTab}
            variant="segmented"
            label={t('bookings_tabs_label')}
            getPanelId={(value) => `bookings-${value}-panel`}
            className={styles.tabs}
          />

          <div
            id="bookings-upcoming-panel"
            role="tabpanel"
            aria-label={t('upcoming')}
            hidden={tab !== 'upcoming'}
          >
            <BookingList
              views={upcomingViews}
              empty={
                <EmptyState
                  title={t('no_upcoming_res_title')}
                  desc={t('no_upcoming_res_desc')}
                  icon="ticket"
                />
              }
              {...listProps}
            />
          </div>

          <div
            id="bookings-past-panel"
            role="tabpanel"
            aria-label={t('past')}
            hidden={tab !== 'past'}
          >
            <BookingList
              views={pastViews}
              empty={
                <EmptyState
                  title={t('no_past_res_title')}
                  desc={t('no_past_res_desc')}
                  icon="clock"
                />
              }
              {...listProps}
            />
          </div>
        </>
      )}
    </AppShell>
  );
}
