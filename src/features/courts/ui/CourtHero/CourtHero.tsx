import { useI18n } from '../../../../i18n';
import { Icon, Seam } from '../../../../shared/ui/Icon';
import type { Court } from '../../model/court.types';
import styles from './CourtHero.module.css';

export function CourtHero({ court }: { court: Court }) {
  const { t } = useI18n();
  return (
    <div className="detail-hero">
      <Seam />
      <div className="hero__glow" />
      <div className={`hero__eyebrow ${styles.eyebrow}`}>
        {court.sport_type || t('tennis')} {t('tennis_court')}
      </div>
      <h1>{court.name}</h1>
      <div className="meta">
        <span>
          <Icon name="court" />
          {court.surface_type}
        </span>
        <span>
          <Icon name="indoor" />
          {court.is_indoor ? t('indoor') : t('outdoor')}
        </span>
        {court.is_lit && (
          <span>
            <Icon name="bulb" />
            {t('floodlit')}
          </span>
        )}
      </div>
    </div>
  );
}
