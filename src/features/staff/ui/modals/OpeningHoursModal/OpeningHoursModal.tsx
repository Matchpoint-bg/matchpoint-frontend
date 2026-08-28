import { useState } from 'react';
import { Icon } from '../../../../../shared/ui/Icon';
import { API_WEEKDAYS, useI18n } from '../../../../../i18n';
import { useAddOpeningHourMutation } from '../../../../clubs';
import { useStaffAction } from '../../../model/useStaffAction';

export function OpeningHoursModal({ clubId, onDone }: { clubId: number; onDone: () => void }) {
  const { t, weekdays } = useI18n();
  const mutation = useAddOpeningHourMutation(clubId);
  const { run } = useStaffAction(onDone);
  const [weekday, setWeekday] = useState<string>(API_WEEKDAYS[0]);
  const [opening, setOpening] = useState('08:00');
  const [closing, setClosing] = useState('22:00');

  return (
    <div>
      <div className="field">
        <label>{t('weekday')}</label>
        <select value={weekday} onChange={(event) => setWeekday(event.target.value)}>
          {API_WEEKDAYS.map((day, index) => (
            <option key={day} value={day}>
              {weekdays[index]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <div className="row2">
          <div>
            <label>{t('opens')}</label>
            <input
              type="time"
              step={1800}
              value={opening}
              onChange={(event) => setOpening(event.target.value)}
            />
          </div>
          <div>
            <label>{t('closes')}</label>
            <input
              type="time"
              step={1800}
              value={closing}
              onChange={(event) => setClosing(event.target.value)}
            />
          </div>
        </div>
      </div>
      <p className="small-note">{t('time_30min_hint')}</p>
      <button
        className="btn btn--primary btn--block"
        disabled={mutation.isPending}
        onClick={() =>
          void run(
            () =>
              mutation.mutateAsync({
                weekday,
                opening_hour: `${opening}:00`,
                closing_hour: `${closing}:00`,
              }),
            t('oh_added'),
          )
        }
      >
        <Icon name="plus" />
        {t('add_opening_hours')}
      </button>
    </div>
  );
}
