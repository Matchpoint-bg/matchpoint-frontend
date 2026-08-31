import { useState } from 'react';
import { useI18n } from '../../../../../i18n';
import { fmt } from '../../../../../shared/lib/format';
import { Icon } from '../../../../../shared/ui/Icon';
import { DateField } from '../../../../../shared/ui/Input';
import { useToast } from '../../../../../shared/ui/Toast';
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
  const { toast } = useToast();
  const today = fmt.isoDate(new Date());
  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(today);
  const [endTime, setEndTime] = useState('11:00');

  const submit = () => {
    const start = new Date(`${startDate}T${startTime}:00`);
    const end = new Date(`${endDate}T${endTime}:00`);
    if (
      !startDate ||
      !startTime ||
      !endDate ||
      !endTime ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      toast(t('block_invalid_range'), 'err');
      return;
    }
    void run(
      () =>
        mutation.mutateAsync({
          // Local wall-clock values intentionally match the current backend
          // contract. The API timezone decision remains tracked in §15.
          start_datetime: `${startDate}T${startTime}:00`,
          end_datetime: `${endDate}T${endTime}:00`,
        }),
      t('time_blocked'),
    );
  };

  return (
    <div>
      <p className={`small-note ${styles.intro}`}>{t('block_hint')}</p>
      <div className="field">
        <div className="row2">
          <div>
            <label htmlFor="unavailability-start-date">{t('start_date')}</label>
            <DateField
              id="unavailability-start-date"
              min={today}
              value={startDate}
              onValueChange={setStartDate}
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
            <label htmlFor="unavailability-end-date">{t('end_date')}</label>
            <DateField
              id="unavailability-end-date"
              min={startDate}
              value={endDate}
              onValueChange={setEndDate}
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
        onClick={submit}
      >
        <Icon name="ban" />
        {t('block_this_time')}
      </button>
    </div>
  );
}
