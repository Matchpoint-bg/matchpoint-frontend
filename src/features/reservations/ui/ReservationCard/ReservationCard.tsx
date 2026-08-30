import { useEffect, useRef } from 'react';
import { useI18n } from '../../../../i18n';
import { fmt } from '../../../../shared/lib/format';
import { BookingStatus, DateTime, Icon, IconButton, Price } from '../../../../shared/ui';
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
              <DateTime value={reservation.start_datetime} end={reservation.end_datetime} /> ·{' '}
              {duration}
              {t('min')}
            </span>
            {reservation.reservation_amt ? (
              <span>
                <Icon name="tag" />
                <Price value={reservation.reservation_amt} />
              </span>
            ) : null}
          </div>
        </div>
        <div className={styles.actions}>
          <BookingStatus status={upcoming ? 'confirmed' : 'completed'} />
          {upcoming && (
            <>
              <IconButton
                icon="clock"
                label={t('reschedule')}
                variant="outline"
                size="sm"
                onClick={() => onReschedule(reservation)}
              />
              <IconButton
                icon="trash"
                label={t('cancel')}
                variant="danger"
                size="sm"
                onClick={() => onCancel(reservation)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
