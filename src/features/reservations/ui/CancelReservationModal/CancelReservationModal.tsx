import { useI18n } from '../../../../i18n';
import { fmt } from '../../../../shared/lib/format';
import { Button, Icon } from '../../../../shared/ui';
import type { BookingView } from '../../model/bookingView.types';
import styles from './CancelReservationModal.module.css';

const FREE_WINDOW_MS = 24 * 60 * 60_000;

interface CancelReservationModalProps {
  view: BookingView;
  onConfirm: () => Promise<void>;
  onKeep: () => void;
  pending?: boolean;
}

export function CancelReservationModal({
  view,
  onConfirm,
  onKeep,
  pending = false,
}: CancelReservationModalProps) {
  const { t, lang } = useI18n();
  const defaultPolicy = t('cancellation_policy_default');
  // A club's own policy is free text — it can say anything about deadlines and
  // fees, and guessing at it would be worse than staying quiet. The timing hint
  // is only honest against the platform default, whose 24 hours we do know.
  const timingHint =
    view.cancellationPolicy === defaultPolicy
      ? new Date(view.start).getTime() - Date.now() > FREE_WINDOW_MS
        ? t('cancel_free_window')
        : t('cancel_late_warning')
      : null;

  return (
    <div>
      <p className={styles.message}>
        {t('cancel_confirm')} <b>{view.courtName}</b> · {view.clubName} {t('on')}{' '}
        {fmt.dateLong(view.start, lang)} {t('at')} {fmt.time(view.start)}?
      </p>

      <div className={styles.policy}>
        <Icon name="info" />
        <div>
          <b>{t('cancellation_policy')}</b>
          <p>{view.cancellationPolicy}</p>
          {timingHint && <p className={styles.timing}>{timingHint}</p>}
        </div>
      </div>

      <p className={styles.consequence}>{t('cancel_consequence')}</p>

      <div className={styles.actions}>
        <Button variant="outline" block disabled={pending} onClick={onKeep}>
          {t('keep_it')}
        </Button>
        <Button variant="danger" block icon="trash" loading={pending} onClick={() => void onConfirm()}>
          {t('cancel_booking')}
        </Button>
      </div>
    </div>
  );
}
