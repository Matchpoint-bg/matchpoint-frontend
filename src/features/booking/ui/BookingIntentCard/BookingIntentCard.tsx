import { useI18n } from '../../../../i18n';
import { fmt } from '../../../../shared/lib/format';
import { Icon, StatusBadge, SurfaceBadge } from '../../../../shared/ui';
import type { BookingIntent } from '../../model/bookingIntent.types';
import styles from './BookingIntentCard.module.css';

export function BookingIntentCard({ intent }: { intent: BookingIntent }) {
  const { t, lang } = useI18n();
  return (
    <article className={styles.card}>
      <div className={styles.heading}>
        <div>
          <span>{intent.clubName}</span>
          <h2>{intent.courtName}</h2>
        </div>
        <SurfaceBadge surface={intent.surface} />
      </div>

      <dl className={styles.details}>
        <div>
          <dt><Icon name="calendar" />{t('search_date')}</dt>
          <dd>{fmt.dateLong(`${intent.date}T12:00:00`, lang)}</dd>
        </div>
        <div>
          <dt><Icon name="clock" />{t('search_time')}</dt>
          <dd>{fmt.time(intent.start)}–{fmt.time(intent.end)}</dd>
        </div>
        <div>
          <dt><Icon name="clock" />{t('duration')}</dt>
          <dd>{intent.durationMinutes}{t('min')}</dd>
        </div>
        <div>
          <dt><Icon name="tag" />{t('total_price')}</dt>
          <dd className={styles.price}>{fmt.money(intent.quotedPrice)}</dd>
        </div>
        <div>
          <dt><Icon name="pin" />{t('label_address')}</dt>
          <dd>{intent.clubAddress}</dd>
        </div>
        <div>
          <dt><Icon name="ticket" />{t('payment_method')}</dt>
          <dd><StatusBadge label={t('pay_on_site')} tone="neutral" /></dd>
        </div>
      </dl>

      <div className={styles.policy}>
        <Icon name="info" />
        <div>
          <strong>{t('cancellation_policy')}</strong>
          <p>{intent.cancellationPolicy}</p>
        </div>
      </div>
    </article>
  );
}
