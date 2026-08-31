import { useId, useMemo } from 'react';
import { useI18n } from '../../../../i18n';
import { fmt } from '../../../../shared/lib/format';

const DAYS_AHEAD = 14;

export function AvailabilityDatePicker({ date, onChange }: { date: string; onChange: (date: string) => void }) {
  const { lang, t } = useI18n();
  const inputId = useId();
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DAYS_AHEAD }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() + index);
      return day;
    });
  }, []);

  return (
    <div className="availability-dates">
      <div className="dayscroll" aria-label={t('search_date')}>
        {days.map((day) => {
          const iso = fmt.isoDate(day);
          return (
            <button
              type="button"
              key={iso}
              className={`daybtn${iso === date ? ' active' : ''}`}
              aria-pressed={iso === date}
              onClick={() => onChange(iso)}
            >
              <small>{fmt.weekday(day.toISOString(), lang)}</small>
              <b>{day.getDate()}</b>
              <small>{fmt.mon(day.toISOString(), lang)}</small>
            </button>
          );
        })}
      </div>
      <div className="datepick">
        <label htmlFor={inputId}>{t('search_date')}</label>
        <input
          id={inputId}
          type="date"
          min={fmt.isoDate(new Date())}
          value={date}
          onChange={(event) => {
            if (event.target.value) onChange(event.target.value);
          }}
        />
      </div>
    </div>
  );
}
