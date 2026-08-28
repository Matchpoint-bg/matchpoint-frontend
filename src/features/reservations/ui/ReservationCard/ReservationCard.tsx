import { useEffect, useRef } from 'react';
import { useI18n } from '../../../../i18n';
import { fmt } from '../../../../shared/lib/format';
import { Icon } from '../../../../shared/ui/Icon';
import type { Reservation } from '../../model/reservation.types';
import styles from './ReservationCard.module.css';

interface ReservationCardProps {
  reservation: Reservation;
  courtLabel: string;
  upcoming: boolean;
  highlighted: boolean;
  onCancel: (reservation: Reservation) => void;
  onReschedule: (reservation: Reservation) => void;
}

export function ReservationCard({
  reservation,
  courtLabel,
  upcoming,
  highlighted,
  onCancel,
  onReschedule,
}: ReservationCardProps) {
  const { t, lang } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const duration = Math.round(
    (new Date(reservation.end_datetime).getTime() -
      new Date(reservation.start_datetime).getTime()) /
      60_000,
  );

  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlighted]);

  return (
    <div ref={ref} className={`card${highlighted ? ` ${styles.flash}` : ''}`}>
      <div className={styles.row}>
        <div className={styles.calendar}>
          <small>{fmt.mon(reservation.start_datetime, lang)}</small>
          <b>{fmt.dayNum(reservation.start_datetime)}</b>
          <small>{fmt.weekday(reservation.start_datetime, lang)}</small>
        </div>
        <div className={styles.main}>
          <h3>{courtLabel}</h3>
          <div className={styles.details}>
            <span>
              <Icon name="clock" />
              {fmt.time(reservation.start_datetime)}-{fmt.time(reservation.end_datetime)} ·{' '}
              {duration}
              {t('min')}
            </span>
            {reservation.reservation_amt ? (
              <span>
                <Icon name="tag" />
                <span className="price-tag">{fmt.money(reservation.reservation_amt)}</span>
              </span>
            ) : null}
          </div>
        </div>
        <div className={styles.actions}>
          <span className={`${styles.status} ${upcoming ? styles.upcoming : styles.past}`}>
            {upcoming ? t('upcoming') : t('played')}
          </span>
          {upcoming && (
            <>
              <button
                className="btn btn--outline btn--sm"
                aria-label={t('reschedule')}
                title={t('reschedule')}
                onClick={() => onReschedule(reservation)}
              >
                <Icon name="clock" />
              </button>
              <button
                className="btn btn--danger btn--sm"
                aria-label={t('cancel')}
                title={t('cancel')}
                onClick={() => onCancel(reservation)}
              >
                <Icon name="trash" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
