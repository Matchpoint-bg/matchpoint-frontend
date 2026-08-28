import { useMemo } from 'react';
import { useI18n } from '../../../../i18n';
import { fmt } from '../../../../shared/lib/format';

const DAYS_AHEAD = 14;

export function AvailabilityDatePicker({ date, onChange }: { date: string; onChange: (date: string) => void }) {
  const { lang } = useI18n();
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DAYS_AHEAD }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() + index);
      return day;
    });
  }, []);

  return (
    <div className="dayscroll">
      {days.map((day) => {
        const iso = fmt.isoDate(day);
        return (
          <button key={iso} className={`daybtn${iso === date ? ' active' : ''}`} onClick={() => onChange(iso)}>
            <small>{fmt.weekday(day.toISOString(), lang)}</small>
            <b>{day.getDate()}</b>
            <small>{fmt.mon(day.toISOString(), lang)}</small>
          </button>
        );
      })}
    </div>
  );
}
