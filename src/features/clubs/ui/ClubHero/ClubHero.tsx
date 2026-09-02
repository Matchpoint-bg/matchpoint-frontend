import { useI18n } from '../../../../i18n';
import { Icon, Seam } from '../../../../shared/ui/Icon';
import type { Club } from '../../model/club.types';
import styles from './ClubHero.module.css';

export function ClubHero({ club }: { club: Club }) {
  const { t } = useI18n();

  return (
    <div className={`detail-hero ${styles.hero}`}>
      <Seam />
      <div className="hero__glow" />
      <div className={styles.copy}>
        <div className={`hero__eyebrow ${styles.eyebrow}`}>{t('tennis_club')}</div>
        <h1>{club.name}</h1>
        <div className="meta">
          <span>
            <Icon name="pin" />
            {club.address || club.city || t('sofia')}
          </span>
          {club.neighbourhood && <span>{club.neighbourhood}</span>}
        </div>
      </div>
      <div className={styles.visual}>
        {club.thumbnail_url ? (
          <img src={club.thumbnail_url} alt="" width="720" height="480" />
        ) : (
          <span>
            <Icon name="court" />
            {t('club_gallery_fallback')}
          </span>
        )}
      </div>
    </div>
  );
}
