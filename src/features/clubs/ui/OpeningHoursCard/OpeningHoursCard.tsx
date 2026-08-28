import { API_WEEKDAYS, useI18n } from '../../../../i18n';
import { Icon } from '../../../../shared/ui/Icon';
import type { OpeningHour } from '../../model/club.types';
import styles from './OpeningHoursCard.module.css';

export function OpeningHoursCard({ hours }: { hours: OpeningHour[] }) {
  const { t, weekdays } = useI18n();
  const byDay = new Map(hours.map((hour) => [hour.weekday, hour]));

  return (
    <div className={`card card--pad ${styles.card}`}>
      <div className={styles.heading}>
        <span className={styles.icon}>
          <Icon name="clock" />
        </span>
        <b className={styles.title}>{t('opening_hours')}</b>
      </div>
      {API_WEEKDAYS.map((day, index) => {
        const hour = byDay.get(day);
        return (
          <div key={day} className={`oh-row${hour ? '' : ' closed'}`}>
            <span className="d">{weekdays[index]}</span>
            <span className="h">
              {hour
                ? `${hour.opening_hour.slice(0, 5)} - ${hour.closing_hour.slice(0, 5)}`
                : t('closed')}
            </span>
          </div>
        );
      })}
    </div>
  );
}
