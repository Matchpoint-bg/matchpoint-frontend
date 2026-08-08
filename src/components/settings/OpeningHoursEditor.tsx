import { useState } from 'react';
import { Icon } from '../Icons';
import { ErrorState, Spinner } from '../States';
import { API_WEEKDAYS, useI18n } from '../../i18n';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { api } from '../../lib/api';
import type { OpeningHour } from '../../types';

const DEFAULT_OPEN = '08:00';
const DEFAULT_CLOSE = '22:00';

/** "08:00:00" from the API, "08:00" from an <input type="time">. Normalise for both. */
function toInput(v: string): string {
  return v.slice(0, 5);
}

function onHalfHour(v: string): boolean {
  const mins = v.slice(3, 5);
  return mins === '00' || mins === '30';
}

/**
 * A week grid for a club's opening hours.
 *
 * The old OpeningHoursModal could only append one weekday at a time, leaving no way to
 * correct or remove an existing row. Rows carry a `pk` from the club endpoint, which is
 * what `/api/openinghours/{pk}/` needs to PATCH or DELETE them.
 */
export function OpeningHoursEditor({ clubId }: { clubId: number }) {
  const { t, weekdays } = useI18n();
  const { toast } = useToast();
  const { data, error, loading, reload } = useAsync(() => api.clubOpeningHours(clubId), [clubId]);
  const [busyDay, setBusyDay] = useState<string | null>(null);

  if (loading) return <Spinner />;
  if (error) return <ErrorState msg={error} onRetry={reload} />;

  const byDay = new Map((data ?? []).map((h) => [h.weekday, h]));

  async function save(weekday: string, row: OpeningHour | undefined, open: string, close: string) {
    if (!onHalfHour(open) || !onHalfHour(close)) return toast(t('hours_invalid_step'), 'err');
    if (close <= open) return toast(t('hours_invalid_order'), 'err');

    setBusyDay(weekday);
    const body: OpeningHour = {
      weekday,
      opening_hour: `${open}:00`,
      closing_hour: `${close}:00`,
    };
    try {
      if (row?.pk !== undefined) await api.updateOpeningHour(row.pk, body);
      else await api.addOpeningHour(clubId, body);
      toast(t('hours_saved'), 'ok');
      reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'err');
    } finally {
      setBusyDay(null);
    }
  }

  async function remove(weekday: string, row: OpeningHour) {
    if (row.pk === undefined) return;
    setBusyDay(weekday);
    try {
      await api.deleteOpeningHour(row.pk, clubId, weekday);
      toast(t('hours_removed'), 'ok');
      reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'err');
    } finally {
      setBusyDay(null);
    }
  }

  return (
    <div>
      {API_WEEKDAYS.map((day, i) => (
        <DayRow
          key={day}
          label={weekdays[i] ?? day}
          row={byDay.get(day)}
          busy={busyDay === day}
          onSave={(open, close) => save(day, byDay.get(day), open, close)}
          onRemove={() => {
            const row = byDay.get(day);
            if (row) void remove(day, row);
          }}
        />
      ))}
      <p className="small-note">{t('time_30min_hint')}</p>
    </div>
  );
}

function DayRow({
  label,
  row,
  busy,
  onSave,
  onRemove,
}: {
  label: string;
  row: OpeningHour | undefined;
  busy: boolean;
  onSave: (open: string, close: string) => void;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(row ? toInput(row.opening_hour) : DEFAULT_OPEN);
  const [close, setClose] = useState(row ? toInput(row.closing_hour) : DEFAULT_CLOSE);

  const dirty = row ? toInput(row.opening_hour) !== open || toInput(row.closing_hour) !== close : true;

  return (
    <div className="hours-row">
      <span className="hours-row__day">{label}</span>

      <input
        type="time"
        step={1800}
        value={open}
        aria-label={t('opens')}
        onChange={(e) => setOpen(e.target.value)}
      />
      <span className="hours-row__sep">–</span>
      <input
        type="time"
        step={1800}
        value={close}
        aria-label={t('closes')}
        onChange={(e) => setClose(e.target.value)}
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
