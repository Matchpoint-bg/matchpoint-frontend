import { useState } from 'react';
import { API_WEEKDAYS, useI18n } from '../../../../../i18n';
import { ErrorState } from '../../../../../shared/ui/ErrorState';
import { Icon } from '../../../../../shared/ui/Icon';
import { Spinner } from '../../../../../shared/ui/Spinner';
import { useCourtPricesQuery, useSetCourtPricesMutation } from '../../../../courts';
import type { Price } from '../../../../courts';
import { useStaffAction } from '../../../model/useStaffAction';
import styles from './PricesModal.module.css';

const DEFAULT_PRICE: Price = {
  weekday: 'Monday',
  time_start: '08:00',
  time_end: '18:00',
  price_per_30_minutes: 8,
};

export function PricesModal({ courtId }: { courtId: number }) {
  const { t, weekdays } = useI18n();
  const pricesQuery = useCourtPricesQuery(courtId);
  const savePrices = useSetCourtPricesMutation(courtId);
  const { run } = useStaffAction();
  const [rows, setRows] = useState<Price[] | null>(null);

  if (pricesQuery.isPending) return <Spinner />;
  if (pricesQuery.error) {
    return (
      <ErrorState
        msg={pricesQuery.error.message}
        onRetry={() => void pricesQuery.refetch()}
      />
    );
  }

  const current = rows ?? (pricesQuery.data?.length ? pricesQuery.data : [DEFAULT_PRICE]);
  const update = (index: number, patch: Partial<Price>) =>
    setRows(
      current.map((price, rowIndex) =>
        rowIndex === index ? { ...price, ...patch } : price,
      ),
    );

  const submit = () =>
    run(
      () =>
        savePrices.mutateAsync(
          current.map((price) => ({
            ...price,
            time_start: `${price.time_start.slice(0, 5)}:00`,
            time_end: `${price.time_end.slice(0, 5)}:00`,
          })),
        ),
      t('prices_saved'),
    );

  return (
    <div>
      <p className={`small-note ${styles.intro}`}>{t('price_hint')}</p>
      {current.map((price, index) => (
        <div key={index} className={`card card--pad ${styles.row}`}>
          <div className={`field ${styles.field}`}>
            <label>{t('weekday')}</label>
            <select
              value={price.weekday}
              onChange={(event) => update(index, { weekday: event.target.value })}
            >
              {API_WEEKDAYS.map((day, dayIndex) => (
                <option key={day} value={day}>
                  {weekdays[dayIndex]}
                </option>
              ))}
            </select>
          </div>
          <div className={`field ${styles.field}`}>
            <div className="row2">
              <div>
                <label>{t('from')}</label>
                <input
                  type="time"
                  step={1800}
                  value={price.time_start.slice(0, 5)}
                  onChange={(event) => update(index, { time_start: event.target.value })}
                />
              </div>
              <div>
                <label>{t('to')}</label>
                <input
                  type="time"
                  step={1800}
                  value={price.time_end.slice(0, 5)}
                  onChange={(event) => update(index, { time_end: event.target.value })}
                />
              </div>
            </div>
          </div>
          <div className={`field ${styles.lastField}`}>
            <label>{t('price30')}</label>
            <input
              type="number"
              step={0.5}
              value={price.price_per_30_minutes}
              onChange={(event) =>
                update(index, { price_per_30_minutes: Number(event.target.value) })
              }
            />
          </div>
          <button
            className={`btn btn--danger btn--sm ${styles.remove}`}
            onClick={() => setRows(current.filter((_, rowIndex) => rowIndex !== index))}
          >
            <Icon name="trash" />
            {t('remove')}
          </button>
        </div>
      ))}
      <button
        className="btn btn--outline btn--sm"
        onClick={() => setRows([...current, { ...DEFAULT_PRICE }])}
      >
        <Icon name="plus" />
        {t('add_price_band')}
      </button>
      <button
        className={`btn btn--primary btn--block ${styles.save}`}
        disabled={savePrices.isPending}
        onClick={() => void submit()}
      >
        <Icon name="check" />
        {t('save_prices')}
      </button>
    </div>
  );
}
