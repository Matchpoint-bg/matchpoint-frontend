import { useI18n } from '../../../../i18n';
import type { TranslationKey } from '../../../../i18n/en';

/** Every state a slot can show, in the order the grid reads top to bottom. */
const ENTRIES: Array<[status: string, label: TranslationKey]> = [
  ['available', 'open'],
  ['selected', 'selected'],
  ['booked', 'booked'],
  ['held', 'held_legend'],
  ['closed', 'closed_legend'],
  ['past', 'past_legend'],
];

export function AvailabilityLegend() {
  const { t } = useI18n();
  return (
    <div className="legend">
      {ENTRIES.map(([status, label]) => (
        <span key={status}>
          <i className="legend__sw" data-status={status} />
          {t(label)}
        </span>
      ))}
    </div>
  );
}
