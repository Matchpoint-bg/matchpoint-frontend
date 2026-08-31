import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { BookingAuthModal, useAuth } from '../../features/auth';
import { BookingIntentCard, useBookingIntentValidation } from '../../features/booking';
import { useI18n } from '../../i18n';
import { BackLink, Button, EmptyState, ErrorState, Icon, Spinner } from '../../shared/ui';
import { useModal } from '../../shared/ui/Modal';
import styles from './BookingReviewPage.module.css';

export function BookingReviewPage() {
  const courtId = Number(useParams().courtId);
  const navigate = useNavigate();
  const { authed } = useAuth();
  const { openModal, closeModal } = useModal();
  const { t } = useI18n();
  const { intent, query, valid } = useBookingIntentValidation(courtId);
  const clubUrl = intent ? `/clubs/${intent.clubId}?date=${intent.date}` : '/players';
  const checking = query.isPending || query.isFetching;

  const proceed = () => {
    if (!authed) {
      openModal(
        t('account_needed_title'),
        <BookingAuthModal
          onSuccess={() => {
            closeModal();
            navigate(`/book/${courtId}/checkout`);
          }}
        />,
      );
      return;
    }
    navigate(`/book/${courtId}/checkout`);
  };

  return (
    <AppShell active="clubs">
      <BackLink label={t('change_time')} onClick={() => navigate(clubUrl)} />

      <header className={styles.header}>
        <span className="eyebrow">{t('review_eyebrow')}</span>
        <h1>{t('review_title')}</h1>
        <p>{t('review_desc')}</p>
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
        <EmptyState
          title={t('booking_conflict_title')}
          desc={t('booking_conflict_desc')}
          icon="clock"
        >
          <Button onClick={() => navigate(clubUrl)}>{t('change_time')}</Button>
        </EmptyState>
      )}
      {intent && !checking && !query.error && valid && (
        <div className={styles.layout}>
          <BookingIntentCard intent={intent} />
          <aside className={styles.actionCard}>
            {!authed && (
              <div className={styles.accountNote}>
                <Icon name="user" />
                <div>
                  <strong>{t('account_needed_title')}</strong>
                  <p>{t('account_needed_desc')}</p>
                </div>
              </div>
            )}
            <Button block icon="arrowRight" iconPosition="end" onClick={proceed}>
              {t('continue')}
            </Button>
          </aside>
        </div>
      )}
    </AppShell>
  );
}
