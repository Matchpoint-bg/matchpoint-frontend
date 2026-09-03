import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import {
  BookingIntentCard,
  bookingIntentStore,
  clubBookingUrl,
  useBookingIntentValidation,
} from '../../features/booking';
import type { BookingConfirmationSnapshot } from '../../features/booking';
import {
  bookingReference,
  useCreateReservationMutation,
  useResolveReservationId,
  useUpdateReservationMutation,
} from '../../features/reservations';
import { useI18n } from '../../i18n';
import { BackLink, Button, EmptyState, ErrorState, Spinner } from '../../shared/ui';
import styles from '../booking-review/BookingReviewPage.module.css';

export function BookingCheckoutPage() {
  const courtId = Number(useParams().courtId);
  const navigate = useNavigate();
  const { t } = useI18n();
  const { intent, query, valid } = useBookingIntentValidation(courtId);
  const createReservation = useCreateReservationMutation();
  const updateReservation = useUpdateReservationMutation();
  const resolveReservationId = useResolveReservationId();
  const submitting = useRef(false);
  const reviewUrl = `/book/${courtId}/review`;
  const checking = query.isPending || query.isFetching;
  const clubUrl = intent ? clubBookingUrl(intent) : '/players';
  const pending = createReservation.isPending || updateReservation.isPending;
  const submitError = createReservation.error ?? updateReservation.error;

  const confirm = async () => {
    if (!intent || !valid || submitting.current) return;
    submitting.current = true;
    const body = {
      court: intent.courtId,
      start_datetime: intent.start,
      end_datetime: intent.end,
    };
    try {
      // Moving a booking is a PATCH, so the player keeps the old time right up
      // until the new one is accepted — never a delete-then-rebook.
      if (intent.rescheduleOf !== undefined) {
        const id = intent.rescheduleOf;
        await updateReservation.mutateAsync({ id, body });
        const moved: BookingConfirmationSnapshot = {
          ...intent,
          reservationId: id,
          bookingReference: bookingReference(id),
          status: 'confirmed',
          confirmedAt: new Date().toISOString(),
        };
        bookingIntentStore.clear();
        bookingIntentStore.saveConfirmation(moved);
        navigate(`/booking/confirmation/${id}`, { replace: true });
        return;
      }

      const created = await createReservation.mutateAsync({
        body,
        meta: { amt: intent.quotedPrice, date: intent.date },
      });
      // The court is booked from here on. A response without an id is a missing
      // deep link, not a failed booking, so never throw on it — look the row up,
      // and fall back to the bookings list if even that comes back empty.
      const id = await resolveReservationId(created, body);
      bookingIntentStore.clear();
      if (id === null) {
        navigate('/reservations', { replace: true });
        return;
      }
      const snapshot: BookingConfirmationSnapshot = {
        ...intent,
        reservationId: id,
        bookingReference: bookingReference(id),
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
      };
      bookingIntentStore.saveConfirmation(snapshot);
      navigate(`/booking/confirmation/${id}`, { replace: true });
    } catch {
      // TanStack Query exposes the error below. Keeping the user on this page
      // avoids losing the intent and gives them a path back to fresh slots.
    } finally {
      submitting.current = false;
    }
  };

  return (
    <AppShell active="clubs">
      <BackLink label={t('back')} onClick={() => navigate(reviewUrl)} />
      <header className={styles.header}>
        <span className="eyebrow">{t('checkout_eyebrow')}</span>
        <h1>{t('checkout_title')}</h1>
        <p>{t('checkout_desc')}</p>
      </header>

      {!intent && (
        <EmptyState title={t('booking_missing_title')} desc={t('booking_missing_desc')} icon="clock">
          <Button onClick={() => navigate('/players')}>{t('find_court')}</Button>
        </EmptyState>
      )}
      {intent && checking && <Spinner />}
      {intent && !checking && query.error && (
        <ErrorState msg={query.error.message} onRetry={() => void query.refetch()} />
      )}
      {intent && !checking && !query.error && !valid && (
        <EmptyState title={t('booking_conflict_title')} desc={t('booking_conflict_desc')} icon="clock">
          <Button onClick={() => navigate(clubUrl)}>
            {t('change_time')}
          </Button>
        </EmptyState>
      )}
      {intent && !checking && !query.error && valid && (
        <div className={styles.layout}>
          <BookingIntentCard intent={intent} />
          <aside className={styles.actionCard}>
            <Button block icon="check" loading={pending} onClick={() => void confirm()}>
              {intent.rescheduleOf !== undefined ? t('confirm_reschedule') : t('confirm_booking')}
            </Button>
            {submitError && (
              <div role="alert" className={styles.accountNote}>
                <div>
                  <p>{submitError.message}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(clubUrl)}
                  >
                    {t('change_time')}
                  </Button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </AppShell>
  );
}
