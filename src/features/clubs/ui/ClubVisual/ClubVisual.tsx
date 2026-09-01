import { useI18n } from '../../../../i18n';
import { Icon } from '../../../../shared/ui';
import styles from './ClubVisual.module.css';

interface ClubVisualProps {
  /** Position in a list; rendered as a two-digit marker. Omit outside of lists. */
  index?: number;
  city?: string;
  className?: string;
}

/**
 * The synthetic court graphic used wherever a club has no photograph — search
 * result cards, and the club gallery's fallback (ToDoRedesign §9). Decorative:
 * it carries no information the surrounding text does not already give.
 */
export function ClubVisual({ index, city, className }: ClubVisualProps) {
  const { t } = useI18n();

  return (
    <div className={className ? `${styles.visual} ${className}` : styles.visual} aria-hidden="true">
      {index !== undefined && (
        <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
      )}
      <span className={styles.city}>{city || t('sofia')}</span>
      <div className={styles.courtLines}>
        <span />
        <span />
        <span />
      </div>
      <Icon name="ball" className={styles.ball} />
    </div>
  );
}
