import type { HTMLAttributes, ReactNode } from 'react';
import { SectionHeader } from '../SectionHeader';

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: string;
  title?: string;
  sub?: string;
  /** Rendered on the right of the header row — a filter, a "see all" link, etc. */
  action?: ReactNode;
  children?: ReactNode;
}

/**
 * Pairs the existing `.section-head` header with its content so pages stop
 * hand-assembling the two.
 */
export function Section({ eyebrow, title, sub, action, children, ...rest }: SectionProps) {
  return (
    <section {...rest}>
      {title && <SectionHeader eyebrow={eyebrow ?? ''} title={title} sub={sub}>{action}</SectionHeader>}
      {children}
    </section>
  );
}
