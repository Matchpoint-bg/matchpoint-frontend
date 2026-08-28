import { useI18n } from '../../../../i18n';
import styles from './ClubFilters.module.css';

interface ClubFiltersProps {
  query: string;
  surface: string | null;
  surfaces: string[];
  onQueryChange: (query: string) => void;
  onSurfaceChange: (surface: string | null) => void;
}

export function ClubFilters({
  query,
  surface,
  surfaces,
  onQueryChange,
  onSurfaceChange,
}: ClubFiltersProps) {
  const { t } = useI18n();

  return (
    <div className="clubfilters">
      <div className={`field ${styles.field}`}>
        <label htmlFor="club-search">{t('search_clubs')}</label>
        <input
          id="club-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('search_clubs_placeholder')}
          autoComplete="off"
        />
      </div>

      {surfaces.length > 0 && (
        <div className="chiprow" role="group" aria-label={t('surface')}>
          <button
            className={`chip chip--btn${surface === null ? ' chip--on' : ''}`}
            aria-pressed={surface === null}
            onClick={() => onSurfaceChange(null)}
          >
            {t('all_surfaces')}
          </button>
          {surfaces.map((option) => (
            <button
              key={option}
              className={`chip chip--btn${surface === option ? ' chip--on' : ''}`}
              aria-pressed={surface === option}
              onClick={() => onSurfaceChange(surface === option ? null : option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
