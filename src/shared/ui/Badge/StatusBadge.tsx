import { Badge } from './Badge';
import type { BadgeSize, BadgeTone } from './Badge';

export type StatusTone = BadgeTone;

export interface StatusBadgeProps {
  /** The visible text. It, not the tone, is what conveys the status. */
  label: string;
  tone?: StatusTone;
  size?: BadgeSize;
  className?: string;
}

/**
 * A status label whose text and tone are supplied by the caller. Domain-specific
 * mappings belong in wrappers like `BookingStatus`, not here.
 */
export function StatusBadge({ label, tone = 'neutral', size, className }: StatusBadgeProps) {
  return (
    <Badge tone={tone} size={size} className={className}>
      {label}
    </Badge>
  );
}
