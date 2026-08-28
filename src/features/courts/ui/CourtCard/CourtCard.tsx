import { useI18n } from '../../../../i18n';
import { Icon } from '../../../../shared/ui/Icon';
import type { Court } from '../../model/court.types';
import { SurfaceChip } from '../SurfaceChip';
import styles from './CourtCard.module.css';

export function CourtCard({ court, onClick }: { court: Court; onClick: () => void }) {
  const { t } = useI18n();

  return (
    <button className={`card card--link ${styles.card}`} onClick={onClick}>
      <div className="card--pad">
        <h3 className={styles.title}>{court.name}</h3>
        <div className={`chiprow ${styles.chips}`}>
          <SurfaceChip surface={court.surface_type} />
          <span className={`chip ${court.is_indoor ? 'chip--indoor' : 'chip--ghost'}`}>
            <Icon name="indoor" />
            {court.is_indoor ? t('indoor') : t('outdoor')}
          </span>
          {court.is_lit && (
            <span className="chip chip--lit">
              <Icon name="bulb" />
              {t('floodlit')}
            </span>
          )}
        </div>
        <div className={styles.availability}>
          <Icon name="calendar" />
          {t('see_availability')}
        </div>
      </div>
    </button>
  );
}
