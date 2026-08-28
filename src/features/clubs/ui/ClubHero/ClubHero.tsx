import { useI18n } from '../../../../i18n';
import { Icon, Seam } from '../../../../shared/ui/Icon';
import type { Club } from '../../model/club.types';
import styles from './ClubHero.module.css';

export function ClubHero({ club }: { club: Club }) {
  const { t } = useI18n();

  return (
    <div className="detail-hero">
      <Seam />
      <div className="hero__glow" />
      <div className={`hero__eyebrow ${styles.eyebrow}`}>{t('tennis_club')}</div>
      <h1>{club.name}</h1>
      <div className="meta">
        <span>
          <Icon name="pin" />
          {club.address || club.city || t('sofia')}
        </span>
        {club.phone && (
          <span>
            <Icon name="phone" />
            {club.phone}
          </span>
        )}
        {club.email && (
          <span>
            <Icon name="mail" />
            {club.email}
          </span>
        )}
      </div>
    </div>
  );
}
