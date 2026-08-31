import type { Slot } from '../../../courts';
import { useI18n } from '../../../../i18n';
import { fmt } from '../../../../shared/lib/format';
import { EmptyState } from '../../../../shared/ui/EmptyState';
import { ErrorState } from '../../../../shared/ui/ErrorState';
import { Skeleton } from '../../../../shared/ui/Skeleton';

function classify(slot: Slot): 'available' | 'booked' | 'held' | 'closed' | 'past' {
  if (slot.status) return slot.status;
  const booked = slot._booked !== undefined ? slot._booked : !slot.available;
  if (booked) return 'booked';
  return slot.available ? 'available' : 'closed';
}

interface SlotGridProps {
  slots: Slot[];
  selected: number[];
  loading: boolean;
  error: string | null;
  onToggle: (index: number) => void;
  onRetry: () => void;
}

export function SlotGrid({
  slots,
  selected,
  loading,
  error,
  onToggle,
  onRetry,
}: SlotGridProps) {
  const { t } = useI18n();
  return (
    <>
      <div className="slotgrid">
        {loading && <Skeleton height={58} count={10} />}
        {!loading &&
          !error &&
          slots.map((slot, index) => {
            const kind = classify(slot);
            const isSelected = selected.includes(index);
            const className =
              kind === 'booked'
                ? 'is-booked'
                : kind !== 'available'
                  ? 'is-un'
                  : isSelected
                    ? 'is-sel'
                    : '';
            return (
              <button
                key={slot.start}
                className={`slot ${className}`}
                disabled={kind !== 'available'}
                onClick={() => onToggle(index)}
                aria-pressed={kind === 'available' ? isSelected : undefined}
                aria-label={`${slot._t || fmt.time(slot.start)}, ${
                  isSelected
                    ? t('selected')
                    : kind === 'available'
                      ? fmt.money(slot.price)
                      : t(kind === 'past' ? 'past_slot' : kind === 'held' ? 'held_slot' : kind === 'booked' ? 'booked' : 'closed_legend')
                }`}
                title={slot.unavailable_reason}
              >
                <div className="slot__t">{slot._t || fmt.time(slot.start)}</div>
                <div className="slot__p">
                  {kind === 'booked'
                    ? t('booked')
                    : kind === 'held'
                      ? t('held_slot')
                      : kind === 'past'
                        ? t('past_slot')
                    : kind === 'closed'
                      ? '—'
                      : fmt.money(slot.price)}
                </div>
              </button>
            );
          })}
      </div>
      {!loading && error && <ErrorState msg={error} onRetry={onRetry} />}
      {!loading && !error && slots.length === 0 && (
        <EmptyState
          title={t('club_closed_title')}
          desc={t('club_closed_desc')}
          icon="clock"
        />
      )}
    </>
  );
}
