import { useState } from 'react';
import { useI18n } from '../../../../../i18n';
import { fmt } from '../../../../../shared/lib/format';
import { Icon } from '../../../../../shared/ui/Icon';
import { useAddUnavailabilityMutation } from '../../../../courts';
import { useStaffAction } from '../../../model/useStaffAction';
import styles from '../StaffModal.module.css';

interface UnavailabilityModalProps {
  courtId: number;
  onDone: () => void;
}

export function UnavailabilityModal({ courtId, onDone }: UnavailabilityModalProps) {
  const { t } = useI18n();
  const mutation = useAddUnavailabilityMutation(courtId);
  const { run } = useStaffAction(onDone);
  const today = fmt.isoDate(new Date());
  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(today);
  const [endTime, setEndTime] = useState('11:00');

  return (
    <div>
      <p className={`small-note ${styles.intro}`}>{t('block_hint')}</p>
      <div className="field">
        <div className="row2">
          <div>
            <label>{t('start_date')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label>{t('start_time')}</label>
            <input
              type="time"
              step={1800}
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="field">
        <div className="row2">
          <div>
            <label>{t('end_date')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <div>
            <label>{t('end_time')}</label>
            <input
              type="time"
              step={1800}
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
            />
          </div>
        </div>
      </div>
      <button
        className="btn btn--primary btn--block"
        disabled={mutation.isPending}
        onClick={() =>
          void run(
            () =>
              mutation.mutateAsync({
                start_datetime: `${startDate}T${startTime}:00`,
                end_datetime: `${endDate}T${endTime}:00`,
              }),
            t('time_blocked'),
          )
        }
      >
        <Icon name="ban" />
        {t('block_this_time')}
      </button>
    </div>
  );
}
