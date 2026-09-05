import { useState } from 'react';
import { ApiError } from '../../../../shared/api/httpClient';
import { useToast } from '../../../../shared/ui/Toast';
import { ErrorState } from '../../../../shared/ui/ErrorState';
import { Spinner } from '../../../../shared/ui/Spinner';
import { API_WEEKDAYS, useI18n } from '../../../../i18n';
import {
  useClubOpeningHoursQuery,
  useDeleteOpeningHourMutation,
  useSaveOpeningHourMutation,
} from '../../../clubs';
import type { OpeningHour } from '../../../clubs';
import { OpeningHoursDayRow } from './OpeningHoursDayRow';

function onHalfHour(value: string): boolean {
  const minutes = value.slice(3, 5);
  return minutes === '00' || minutes === '30';
}

/**
 * `/api/openinghours/{pk}/` guards itself with `IsClubEmployeeOrAdmin`, whose
 * object check only answers for Club and Court instances — on an OpeningHours row
 * it returns nothing, which DRF reads as "denied". Every caller gets a 403,
 * superusers included, so the generic permission text would be misleading.
 */
function editBlocked(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}

export function OpeningHoursEditor({ clubId }: { clubId: number }) {
  const { t, weekdays } = useI18n();
  const { toast } = useToast();
  const hoursQuery = useClubOpeningHoursQuery(clubId);
  const saveHour = useSaveOpeningHourMutation(clubId);
  const deleteHour = useDeleteOpeningHourMutation(clubId);
  const [busyDay, setBusyDay] = useState<string | null>(null);

  if (hoursQuery.isPending) return <Spinner />;
  if (hoursQuery.error) {
    return <ErrorState msg={hoursQuery.error.message} onRetry={() => void hoursQuery.refetch()} />;
  }

  const byDay = new Map((hoursQuery.data ?? []).map((hour) => [hour.weekday, hour]));

  async function save(weekday: string, row: OpeningHour | undefined, open: string, close: string) {
    if (!onHalfHour(open) || !onHalfHour(close)) return toast(t('hours_invalid_step'), 'err');
    if (close <= open) return toast(t('hours_invalid_order'), 'err');
    setBusyDay(weekday);
    try {
      await saveHour.mutateAsync({
        row,
        body: { weekday, opening_hour: `${open}:00`, closing_hour: `${close}:00` },
      });
      toast(t('hours_saved'), 'ok');
    } catch (error) {
      if (row && editBlocked(error)) toast(t('hours_locked'), 'err');
      else toast(error instanceof Error ? error.message : String(error), 'err');
    } finally {
      setBusyDay(null);
    }
  }

  async function remove(weekday: string, row: OpeningHour) {
    if (row.pk === undefined) return;
    setBusyDay(weekday);
    try {
      await deleteHour.mutateAsync({ pk: row.pk, weekday });
      toast(t('hours_removed'), 'ok');
    } catch (error) {
      if (editBlocked(error)) toast(t('hours_locked'), 'err');
      else toast(error instanceof Error ? error.message : String(error), 'err');
    } finally {
      setBusyDay(null);
    }
  }

  return (
    <div>
      {API_WEEKDAYS.map((day, index) => (
        <OpeningHoursDayRow
          key={day}
          label={weekdays[index] ?? day}
          row={byDay.get(day)}
          busy={busyDay === day}
          onSave={(open, close) => void save(day, byDay.get(day), open, close)}
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
