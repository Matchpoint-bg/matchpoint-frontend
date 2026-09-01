import { useMemo, useState } from 'react';
import { useI18n } from '../../../../i18n';
import type { Club } from '../../model/club.types';
import { ClubVisual } from '../ClubVisual';
import styles from './ClubGallery.module.css';

/**
 * Club gallery (ToDoRedesign §9). The API has no image field yet, so this is
 * built to degrade: with no photos — or with every photo failing to load — it
 * falls back to the same court graphic the search results use, never to an empty
 * frame or a broken-image icon.
 */
export function ClubGallery({ club }: { club: Club }) {
  const { t } = useI18n();
  const [broken, setBroken] = useState<string[]>([]);
  const [lead, setLead] = useState(0);

  const images = useMemo(
    () => (club.images ?? []).filter((src) => src && !broken.includes(src)),
    [broken, club.images],
  );

  if (images.length === 0) {
    return <ClubVisual city={club.city} className={styles.fallback} />;
  }

  // A photo can drop out after the lead index was chosen; clamp rather than blank.
  const active = Math.min(lead, images.length - 1);
  const activeSrc = images[active] as string;
  const alt = `${t('club_photo_of')} ${club.name}`;
  const onError = (src: string) => setBroken((prev) => (prev.includes(src) ? prev : [...prev, src]));

  return (
    <figure className={styles.gallery} aria-label={t('club_photos')}>
      <img
        className={styles.lead}
        src={activeSrc}
        alt={alt}
        width={1600}
        height={900}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onError={() => onError(activeSrc)}
      />

      {images.length > 1 && (
        <div className={`dayscroll ${styles.thumbs}`}>
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              className={styles.thumb}
              aria-label={`${t('club_photo_show')} ${index + 1}`}
              aria-pressed={index === active}
              onClick={() => setLead(index)}
            >
              <img
                src={src}
                alt=""
                width={320}
                height={180}
                loading="lazy"
                decoding="async"
                onError={() => onError(src)}
              />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}
