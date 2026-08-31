import type { Slot } from '../../../courts';
import { useI18n } from '../../../../i18n';
import { fmt } from '../../../../shared/lib/format';
import { EmptyState } from '../../../../shared/ui/EmptyState';
import { ErrorState } from '../../../../shared/ui/ErrorState';
import { Skeleton } from '../../../../shared/ui/Skeleton';
import { isSelectable, slotReasonKey, slotStatus } from '../../model/slotStatus';

interface SlotGridProps {
  slots: Slot[];
  /** Predicate rather than an index list, so one selection can span courts. */
  isSelected: (index: number) => boolean;
  loading?: boolean;
  error?: string | null;
  onToggle: (index: number) => void;
  onRetry?: () => void;
}

/**
 * One court's 30-minute slots for a day. Each slot carries its time and price,
 * and a `data-status` the stylesheet paints from (ToDoRedesign §9) — unusable
 * slots stay visible with a reason rather than disappearing.
 */
export function SlotGrid({ slots, isSelected, loading, error, onToggle, onRetry }: SlotGridProps) {
  const { t } = useI18n();
  const now = new Date();

  if (loading) {
    return (
      <div className="slotgrid">
        <Skeleton height={58} count={10} />
      </div>
    );
  }
  if (error) return <ErrorState msg={error} onRetry={onRetry ?? (() => {})} />;
  if (slots.length === 0) {
    return <EmptyState title={t('club_closed_title')} desc={t('club_closed_desc')} icon="clock" />;
  }

  return (
    <div className="slotgrid">
      {slots.map((slot, index) => {
        const status = slotStatus(slot, now);
        const selectable = isSelectable(status);
        const selected = selectable && isSelected(index);
        const reasonKey = slotReasonKey(status);
        const reason = reasonKey ? t(reasonKey) : null;
        const time = slot._t || fmt.time(slot.start);
        return (
          <button
            key={slot.start}
            type="button"
            className="slot"
            data-status={status}
            data-selected={selected ? 'true' : undefined}
            disabled={!selectable}
            title={reason ?? undefined}
            aria-pressed={selectable ? selected : undefined}
            aria-label={reason ? `${time} — ${reason}` : `${time} · ${fmt.money(slot.price)}`}
            onClick={() => onToggle(index)}
          >
            <span className="slot__t">{time}</span>
            <span className="slot__p">{selectable ? fmt.money(slot.price) : (reason ?? '—')}</span>
          </button>
        );
      })}
    </div>
  );
}
