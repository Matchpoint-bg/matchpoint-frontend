import { useI18n } from '../../../../i18n';
import { Card, Chip, ChipRow, Icon, SurfaceBadge } from '../../../../shared/ui';
import type { Court } from '../../model/court.types';
import styles from './CourtCard.module.css';

export function CourtCard({ court, onClick }: { court: Court; onClick: () => void }) {
  const { t } = useI18n();

  return (
    <Card as="button" interactive onClick={onClick} className={styles.card}>
      <div className="card--pad">
        <h3 className={styles.title}>{court.name}</h3>
        <ChipRow className={styles.chips}>
          <SurfaceBadge surface={court.surface_type} />
          <Chip variant={court.is_indoor ? 'indoor' : 'ghost'} icon="indoor">
            {court.is_indoor ? t('indoor') : t('outdoor')}
          </Chip>
          {court.is_lit && (
            <Chip variant="lit" icon="bulb">
              {t('floodlit')}
            </Chip>
          )}
        </ChipRow>
        <div className={styles.availability}>
          <Icon name="calendar" />
          {t('see_availability')}
        </div>
      </div>
    </Card>
  );
}
