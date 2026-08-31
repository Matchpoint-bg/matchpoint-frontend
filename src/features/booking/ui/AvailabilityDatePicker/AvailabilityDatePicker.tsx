import { useMemo } from 'react';
import { useI18n } from '../../../../i18n';
import { fmt } from '../../../../shared/lib/format';
import { DateField, Field } from '../../../../shared/ui';
import styles from './AvailabilityDatePicker.module.css';

const DAYS_AHEAD = 14;

/**
 * Today plus the next fortnight as a strip, with a real date input beside it so
 * dates past the strip — and keyboard/screen-reader users — are not stranded
 * (ToDoRedesign §9).
 */
export function AvailabilityDatePicker({
  date,
  onChange,
}: {
  date: string;
  onChange: (date: string) => void;
}) {
  const { t, lang } = useI18n();
  const today = useMemo(() => fmt.isoDate(new Date()), []);
  const days = useMemo(() => {
    const start = new Date();
    return Array.from({ length: DAYS_AHEAD }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, []);

  return (
    <div className={styles.wrap}>
      <div className="dayscroll" role="group" aria-label={t('pick_date')}>
        {days.map((day) => {
          const iso = fmt.isoDate(day);
          const active = iso === date;
          return (
            <button
              key={iso}
              type="button"
              className={`daybtn${active ? ' active' : ''}`}
              aria-pressed={active}
              onClick={() => onChange(iso)}
            >
              <small>{iso === today ? t('today') : fmt.weekday(day.toISOString(), lang)}</small>
              <b>{day.getDate()}</b>
              <small>{fmt.mon(day.toISOString(), lang)}</small>
            </button>
          );
        })}
      </div>
      <Field label={t('pick_date')} className={styles.field}>
        {(control) => (
          <DateField {...control} value={date} min={today} onChange={(event) => onChange(event.target.value)} />
        )}
      </Field>
    </div>
  );
}
