import { useState } from 'react';
import { useI18n } from '../../../../i18n';
import { Icon } from '../../../../shared/ui/Icon';
import styles from './ClubGallery.module.css';

export interface ClubGalleryProps {
  /** Photo URLs, most representative first. Empty renders the placeholder. */
  photos: string[];
  clubName: string;
}

/**
 * The club's photos: one large image with a thumbnail strip under it.
 *
 * The API has no club gallery — a club owns a single `header_image` and each
 * court owns its own images — so the list handed in here is assembled by the
 * caller from both. Keeps the existing placeholder for clubs with no photos
 * at all, which is still most of them.
 */
export function ClubGallery({ photos, clubName }: ClubGalleryProps) {
  const { t } = useI18n();
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className={styles.card}>
        <span className={styles.fallback}>
          <Icon name="court" />
          {t('club_gallery_fallback')}
        </span>
      </div>
    );
  }

  // A club can lose a photo between renders; never index past the end.
  const current = photos[Math.min(active, photos.length - 1)];

  return (
    <div className={styles.card}>
      <img className={styles.main} src={current} alt={clubName} width="720" height="480" />
      {photos.length > 1 && (
        <div className={styles.thumbs} role="tablist" aria-label={t('club_photos_card')}>
          {photos.map((photo, index) => (
            <button
              key={photo}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`${clubName} ${index + 1}`}
              className={`${styles.thumb} ${index === active ? styles.active : ''}`}
              onClick={() => setActive(index)}
            >
              <img src={photo} alt="" width="120" height="80" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
