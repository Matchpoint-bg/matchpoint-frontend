import { useI18n } from '../../../../i18n';
import { Icon, SurfaceBadge } from '../../../../shared/ui';
import type { Club, ClubCourtSummary } from '../../../clubs';
import styles from './ClubResultCard.module.css';

interface ClubResultCardProps {
  club: Club;
  courts: ClubCourtSummary;
  index: number;
  onView: () => void;
}

export function ClubResultCard({ club, courts, index, onView }: ClubResultCardProps) {
  const { t } = useI18n();
  const location = club.address || club.city || t('sofia');
  const shortIndex = String(index + 1).padStart(2, '0');

  return (
    <article className={styles.card}>
      <div className={styles.visual} aria-hidden="true">
        <span className={styles.number}>{shortIndex}</span>
        <span className={styles.city}>{club.city || t('sofia')}</span>
        <div className={styles.courtLines}>
          <span />
          <span />
          <span />
        </div>
        <Icon name="ball" className={styles.ball} />
      </div>

      <div className={styles.body}>
        <div className={styles.heading}>
          <div>
            <span className={styles.kind}>{t('tennis_club')}</span>
            <h3>{club.name}</h3>
          </div>
          <span
            className={styles.verified}
            role="img"
            aria-label={t('search_club_listed')}
          >
            <Icon name="check" />
          </span>
        </div>

        <p className={styles.location}>
          <Icon name="pin" />
          <span>{location}</span>
        </p>

        {club.description && <p className={styles.description}>{club.description}</p>}

        {(courts.count > 0 || courts.surfaces.length > 0) && (
          <div className={styles.tags}>
            {courts.count > 0 && (
              <span className={styles.courtCount}>
                <Icon name="court" />
                {courts.count} {t('courts_suffix')}
              </span>
            )}
            {courts.surfaces.slice(0, 3).map((surface) => (
              <SurfaceBadge key={surface} surface={surface} />
            ))}
            {courts.indoorCount > 0 && (
              <span className={styles.indoorTag}>
                <Icon name="indoor" />
                {t('indoor')}
              </span>
            )}
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.availabilityHint}>
            <Icon name="clock" />
            {t('search_times_inside')}
          </span>
          <button type="button" onClick={onView}>
            {t('search_view_times')}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </article>
  );
}
