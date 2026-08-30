import { Chip } from '../Chip';
import type { ChipVariant } from '../Chip';

/**
 * Court surface label. Promoted from features/courts so clubs, courts, search
 * results and staff tools all read a surface the same way.
 */
const SURFACE_VARIANT: Record<string, ChipVariant> = {
  Clay: 'clay',
  Grass: 'grass',
  Hard: 'hard',
};

export function SurfaceBadge({ surface }: { surface: string }) {
  return (
    <Chip variant={SURFACE_VARIANT[surface] ?? 'ghost'} icon="court">
      {surface}
    </Chip>
  );
}
