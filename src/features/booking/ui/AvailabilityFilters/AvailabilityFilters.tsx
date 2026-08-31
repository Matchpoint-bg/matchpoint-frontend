import { useI18n } from '../../../../i18n';
import { ChipRow, FilterChip } from '../../../../shared/ui';

export type CoverFilter = 'indoor' | 'outdoor' | null;

interface AvailabilityFiltersProps {
  /** Surfaces present in this club; the row hides unless there are at least two. */
  surfaces: string[];
  hasIndoor: boolean;
  hasOutdoor: boolean;
  surface: string | null;
  cover: CoverFilter;
  onSurfaceChange: (surface: string | null) => void;
  onCoverChange: (cover: CoverFilter) => void;
}

/**
 * Narrows the court list on a club page. ToDoRedesign §9 asks for these "only
 * when they make sense", so each row renders only where the club's courts
 * actually differ on that axis — a single-surface club shows nothing.
 */
export function AvailabilityFilters({
  surfaces,
  hasIndoor,
  hasOutdoor,
  surface,
  cover,
  onSurfaceChange,
  onCoverChange,
}: AvailabilityFiltersProps) {
  const { t } = useI18n();
  const showSurfaces = surfaces.length > 1;
  const showCover = hasIndoor && hasOutdoor;
  if (!showSurfaces && !showCover) return null;

  return (
    <ChipRow role="group" aria-label={t('filter_courts')}>
      {showSurfaces &&
        surfaces.map((item) => (
          <FilterChip
            key={item}
            selected={surface === item}
            onClick={() => onSurfaceChange(surface === item ? null : item)}
          >
            {item}
          </FilterChip>
        ))}
      {showCover && (
        <>
          <FilterChip
            icon="indoor"
            selected={cover === 'indoor'}
            onClick={() => onCoverChange(cover === 'indoor' ? null : 'indoor')}
          >
            {t('indoor')}
          </FilterChip>
          <FilterChip
            icon="sun"
            selected={cover === 'outdoor'}
            onClick={() => onCoverChange(cover === 'outdoor' ? null : 'outdoor')}
          >
            {t('outdoor')}
          </FilterChip>
        </>
      )}
    </ChipRow>
  );
}
