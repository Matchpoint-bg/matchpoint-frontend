import { useI18n } from '../../../../i18n';
import { fmt } from '../../../../shared/lib/format';
import { Icon } from '../../../../shared/ui/Icon';
import type { Reservation } from '../../model/reservation.types';
import styles from './CancelReservationModal.module.css';

interface CancelReservationModalProps {
  reservation: Reservation;
  courtLabel: string;
  onConfirm: () => Promise<void>;
  onKeep: () => void;
}

export function CancelReservationModal({
  reservation,
  courtLabel,
  onConfirm,
  onKeep,
}: CancelReservationModalProps) {
  const { t, lang } = useI18n();

  return (
    <div>
      <p className={styles.message}>
        {t('cancel_confirm')} <b>{courtLabel}</b> {t('on')}{' '}
        {fmt.dateLong(reservation.start_datetime, lang)} {t('at')}{' '}
        {fmt.time(reservation.start_datetime)}?
      </p>
      <div className={styles.actions}>
        <button className="btn btn--outline btn--block" onClick={onKeep}>
          {t('keep_it')}
        </button>
        <button className="btn btn--danger btn--block" onClick={() => void onConfirm()}>
          <Icon name="trash" />
          {t('cancel_booking')}
        </button>
      </div>
    </div>
  );
}
