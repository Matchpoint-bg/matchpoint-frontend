import { useI18n } from '../../../../i18n';
import { Icon, Seam } from '../../../../shared/ui/Icon';
import { SurfaceChip } from '../../../courts/ui/SurfaceChip';
import type { Club } from '../../model/club.types';
import type { ClubCourtSummary } from '../../model/useClubFilters';
import styles from './ClubCard.module.css';

interface ClubCardProps {
  club: Club;
  courts: ClubCourtSummary;
  onClick: () => void;
}

export function ClubCard({ club, courts, onClick }: ClubCardProps) {
  const { t } = useI18n();

  return (
    <button className="card card--link" onClick={onClick}>
      <div className="club-card__top">
        <Seam className="club-card__seam" />
      </div>
      <div className="club-card__body">
        <h3>{club.name}</h3>
        <div className="club-card__meta">
          <Icon name="pin" />
          <span>{club.address || club.city || t('sofia')}</span>
        </div>
        {club.description && <p className={styles.description}>{club.description}</p>}
        <div className="chiprow">
          {courts.count > 0 && (
            <span className="chip">
              <Icon name="court" />
              {courts.count} {t('courts_suffix')}
            </span>
          )}
          {courts.surfaces.map((surface) => (
            <SurfaceChip key={surface} surface={surface} />
          ))}
        </div>
      </div>
    </button>
  );
}
