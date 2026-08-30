import type { HTMLAttributes, ReactNode } from 'react';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: IconName;
  children?: ReactNode;
}

/**
 * Small status label over the global `.badge` classes. Unlike `Chip` this is
 * never interactive — it states a fact about the thing it sits on. The text
 * always carries the meaning, so tone stays a reinforcement, not the signal.
 */
export function Badge({ tone = 'neutral', size = 'sm', icon, className, children, ...rest }: BadgeProps) {
  const cls = ['badge', `badge--${tone}`, size === 'md' && 'badge--md', className]
    .filter(Boolean)
    .join(' ');

  return (
    <span {...rest} className={cls}>
      {icon && <Icon name={icon} aria-hidden="true" focusable="false" />}
      {children}
    </span>
  );
}
