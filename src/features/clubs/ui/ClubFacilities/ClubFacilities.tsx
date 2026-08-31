import { useI18n } from '../../../../i18n';
import { Chip, ChipRow, SurfaceBadge } from '../../../../shared/ui';
import type { Court } from '../../../courts';
import type { ClubCourtSummary } from '../../model/useClubFilters';

/**
 * Surfaces, cover and lighting at a glance (ToDoRedesign §9). Counts come from
 * the club's own courts, so an all-outdoor club shows no indoor chip rather
 * than an empty one.
 */
export function ClubFacilities({
  summary,
  courts,
}: {
  summary: ClubCourtSummary;
  courts: Court[];
}) {
  const { t } = useI18n();
  const litCount = courts.filter((court) => court.is_lit).length;
  if (summary.count === 0) return null;

  return (
    <ChipRow aria-label={t('club_facilities')}>
      {summary.surfaces.map((surface) => (
        <SurfaceBadge key={surface} surface={surface} />
      ))}
      {summary.indoorCount > 0 && (
        <Chip variant="indoor" icon="indoor">
          {summary.indoorCount} × {t('indoor')}
        </Chip>
      )}
      {summary.outdoorCount > 0 && (
        <Chip variant="ghost" icon="sun">
          {summary.outdoorCount} × {t('outdoor')}
        </Chip>
      )}
      {litCount > 0 && (
        <Chip variant="lit" icon="bulb">
          {litCount} × {t('floodlit')}
        </Chip>
      )}
    </ChipRow>
  );
}
