import { Icon } from './Icons';

const SURFACE_CLASS: Record<string, string> = {
  Clay: 'chip--clay',
  Grass: 'chip--grass',
  Hard: 'chip--hard',
};

export function SurfaceChip({ surface }: { surface: string }) {
  return (
    <span className={`chip ${SURFACE_CLASS[surface] ?? 'chip--ghost'}`}>
      <Icon name="court" />
      {surface}
    </span>
  );
}
