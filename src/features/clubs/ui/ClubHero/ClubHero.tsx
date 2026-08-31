import { useI18n } from '../../../../i18n';
import { Icon, LinkButton, Seam } from '../../../../shared/ui';
import type { Club } from '../../model/club.types';
import type { ClubCourtSummary } from '../../model/useClubFilters';
import styles from './ClubHero.module.css';

/**
 * Compact club identity (ToDoRedesign §9): who and where, the facts that build
 * trust, and the two actions worth taking off-site. Everything else — hours,
 * description — sits below the booking module, not above it.
 *
 * Gallery and map/directions are deliberately absent: the API exposes neither
 * images nor coordinates yet.
 */
export function ClubHero({ club, summary }: { club: Club; summary?: ClubCourtSummary }) {
  const { t } = useI18n();
  const place = club.address || club.city || t('sofia');
  const facts = [
    summary && summary.count > 0
      ? summary.count === 1
        ? t('courts_count_one')
        : `${summary.count} ${t('courts_suffix')}`
      : null,
    summary?.indoorCount ? t('indoor') : null,
    ...(summary?.surfaces ?? []),
  ].filter(Boolean);

  return (
    <div className="detail-hero">
      <Seam />
      <div className="hero__glow" />
      <div className={`hero__eyebrow ${styles.eyebrow}`}>{t('tennis_club')}</div>
      <h1>{club.name}</h1>
      <div className="meta">
        <span>
          <Icon name="pin" />
          {place}
        </span>
        {facts.map((fact) => (
          <span key={fact}>
            <Icon name="court" />
            {fact}
          </span>
        ))}
      </div>
      {(club.phone || club.website) && (
        <div className={styles.actions}>
          {club.phone && (
            <LinkButton variant="soft" size="sm" icon="phone" href={`tel:${club.phone}`}>
              {t('call_club')}
            </LinkButton>
          )}
          {club.website && (
            <LinkButton
              variant="soft"
              size="sm"
              icon="info"
              href={club.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('visit_website')}
            </LinkButton>
          )}
        </div>
      )}
    </div>
  );
}
