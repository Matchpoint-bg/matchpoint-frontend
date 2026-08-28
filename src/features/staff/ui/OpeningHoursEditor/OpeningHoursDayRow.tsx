import { useState } from 'react';
import { Icon } from '../../../../shared/ui/Icon';
import { useI18n } from '../../../../i18n';
import type { OpeningHour } from '../../../clubs';

const DEFAULT_OPEN = '08:00';
const DEFAULT_CLOSE = '22:00';
const toInput = (value: string): string => value.slice(0, 5);

interface OpeningHoursDayRowProps {
  label: string;
  row: OpeningHour | undefined;
  busy: boolean;
  onSave: (open: string, close: string) => void;
  onRemove: () => void;
}

export function OpeningHoursDayRow({
  label,
  row,
  busy,
  onSave,
  onRemove,
}: OpeningHoursDayRowProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(row ? toInput(row.opening_hour) : DEFAULT_OPEN);
  const [close, setClose] = useState(row ? toInput(row.closing_hour) : DEFAULT_CLOSE);
  const dirty = row
    ? toInput(row.opening_hour) !== open || toInput(row.closing_hour) !== close
    : true;

  return (
    <div className="hours-row">
      <span className="hours-row__day">{label}</span>
      <input
        type="time"
        step={1800}
        value={open}
        aria-label={t('opens')}
        onChange={(event) => setOpen(event.target.value)}
      />
      <span className="hours-row__sep">–</span>
      <input
        type="time"
        step={1800}
        value={close}
        aria-label={t('closes')}
        onChange={(event) => setClose(event.target.value)}
      />
      {!row && <span className="hours-row__closed">{t('closed')}</span>}
      <span className="hours-row__actions">
        <button
          className="btn btn--soft btn--sm"
          disabled={busy || !dirty}
          onClick={() => onSave(open, close)}
        >
          <Icon name="check" />
          {row ? t('save_day') : t('add_day')}
        </button>
        {row && (
          <button
            className="btn btn--danger btn--sm"
            disabled={busy}
            aria-label={t('clear_day')}
            title={t('clear_day')}
            onClick={onRemove}
          >
            <Icon name="trash" />
          </button>
        )}
      </span>
    </div>
  );
}
