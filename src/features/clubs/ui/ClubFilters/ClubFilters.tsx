import { useI18n } from '../../../../i18n';
import { ChipRow, Field, FilterChip, SearchInput } from '../../../../shared/ui';
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
      <Field label={t('search_clubs')} htmlFor="club-search" className={styles.field}>
        {(control) => (
          <SearchInput
            {...control}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onClear={() => onQueryChange('')}
            clearLabel={t('clear_search')}
            placeholder={t('search_clubs_placeholder')}
          />
        )}
      </Field>

      {surfaces.length > 0 && (
        <ChipRow role="group" aria-label={t('surface')}>
          <FilterChip selected={surface === null} onClick={() => onSurfaceChange(null)}>
            {t('all_surfaces')}
          </FilterChip>
          {surfaces.map((option) => (
            <FilterChip
              key={option}
              selected={surface === option}
              onClick={() => onSurfaceChange(surface === option ? null : option)}
            >
              {option}
            </FilterChip>
          ))}
        </ChipRow>
      )}
    </div>
  );
}
