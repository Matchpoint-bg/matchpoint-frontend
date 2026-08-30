import { useI18n } from '../../../i18n';
import type { TranslationKey } from '../../../i18n/en';
import { StatusBadge } from './StatusBadge';
import type { BadgeSize, BadgeTone } from './Badge';

export type BookingStatusValue =
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'
  | 'no_show';

/**
 * The single place that decides how a booking status looks and reads. When the
 * API grows an explicit status field, only this map has to learn about it.
 */
const STATUS: Record<BookingStatusValue, { tone: BadgeTone; key: TranslationKey }> = {
  confirmed: { tone: 'success', key: 'upcoming' },
  pending: { tone: 'warning', key: 'status_pending' },
  cancelled: { tone: 'danger', key: 'status_cancelled' },
  completed: { tone: 'neutral', key: 'played' },
  no_show: { tone: 'neutral', key: 'status_no_show' },
};

export function BookingStatus({
  status,
  size,
  className,
}: {
  status: BookingStatusValue;
  size?: BadgeSize;
  className?: string;
}) {
  const { t } = useI18n();
  const { tone, key } = STATUS[status];
  return <StatusBadge label={t(key)} tone={tone} size={size} className={className} />;
}
