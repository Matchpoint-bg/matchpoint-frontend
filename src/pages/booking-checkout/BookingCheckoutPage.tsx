import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import {
  BookingIntentCard,
  bookingIntentStore,
  useBookingIntentValidation,
} from '../../features/booking';
import type { BookingConfirmationSnapshot } from '../../features/booking';
import { useCreateReservationMutation } from '../../features/reservations';
import { useI18n } from '../../i18n';
import { BackLink, Button, EmptyState, ErrorState, Spinner } from '../../shared/ui';
import styles from '../booking-review/BookingReviewPage.module.css';

export function BookingCheckoutPage() {
  const courtId = Number(useParams().courtId);
  const navigate = useNavigate();
  const { t } = useI18n();
  const { intent, query, valid } = useBookingIntentValidation(courtId);
  const createReservation = useCreateReservationMutation();
  const submitting = useRef(false);
  const reviewUrl = `/book/${courtId}/review`;
  const checking = query.isPending || query.isFetching;

  const confirm = async () => {
    if (!intent || !valid || submitting.current) return;
    submitting.current = true;
    try {
      const created = await createReservation.mutateAsync({
        body: {
          court: intent.courtId,
          start_datetime: intent.start,
          end_datetime: intent.end,
        },
        meta: { amt: intent.quotedPrice, date: intent.date },
      });
      if (!created?.id) throw new Error('The booking response did not include an id.');
      const snapshot: BookingConfirmationSnapshot = {
        ...intent,
        reservationId: created.id,
        bookingReference: `MP-${created.id}`,
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
      };
      bookingIntentStore.saveConfirmation(snapshot);
      bookingIntentStore.clear();
      navigate(`/booking/confirmation/${created.id}`, { replace: true });
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
          <Button onClick={() => navigate(`/clubs/${intent.clubId}?date=${intent.date}`)}>
            {t('change_time')}
          </Button>
        </EmptyState>
      )}
      {intent && !checking && !query.error && valid && (
        <div className={styles.layout}>
          <BookingIntentCard intent={intent} />
          <aside className={styles.actionCard}>
            <Button
              block
              icon="check"
              loading={createReservation.isPending}
              onClick={() => void confirm()}
            >
              {t('confirm_booking')}
            </Button>
            {createReservation.error && (
              <div role="alert" className={styles.accountNote}>
                <div>
                  <p>{createReservation.error.message}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/clubs/${intent.clubId}?date=${intent.date}`)}
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
