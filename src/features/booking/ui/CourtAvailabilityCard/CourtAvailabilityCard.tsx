import type { Court, Slot } from '../../../courts';
import { useI18n } from '../../../../i18n';
import { Chip, ChipRow, SurfaceBadge } from '../../../../shared/ui';
import { SlotGrid } from '../SlotGrid';
import styles from './CourtAvailabilityCard.module.css';

interface CourtAvailabilityCardProps {
  court: Court;
  slots: Slot[];
  isSelected: (index: number) => boolean;
  loading?: boolean;
  error?: string | null;
  onToggle: (index: number) => void;
  onRetry?: () => void;
}

/**
 * A court's identity above its own slot row — the "group available times by
 * court" grouping from ToDoRedesign §9, and what replaced `CourtCard` in the
 * player flow.
 */
export function CourtAvailabilityCard({
  court,
  slots,
  isSelected,
  loading,
  error,
  onToggle,
  onRetry,
}: CourtAvailabilityCardProps) {
  const { t } = useI18n();
  return (
    <section className={`card ${styles.card}`} aria-label={court.name}>
      <header className={styles.head}>
        <h3 className={styles.name}>{court.name}</h3>
        <ChipRow>
          <SurfaceBadge surface={court.surface_type} />
          <Chip variant={court.is_indoor ? 'indoor' : 'ghost'} icon={court.is_indoor ? 'indoor' : 'sun'}>
            {court.is_indoor ? t('indoor') : t('outdoor')}
          </Chip>
          {court.is_lit && <Chip variant="lit" icon="bulb">{t('floodlit')}</Chip>}
        </ChipRow>
      </header>
      <SlotGrid
        slots={slots}
        isSelected={isSelected}
        loading={loading}
        error={error}
        onToggle={onToggle}
        onRetry={onRetry}
      />
    </section>
  );
}
