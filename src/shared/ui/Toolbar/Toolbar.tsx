import type { HTMLAttributes, ReactNode } from 'react';

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** How the row distributes its children along the main axis. */
  align?: 'start' | 'between' | 'end';
  wrap?: boolean;
  /** Sticks to the top of the scroll container at `--z-sticky`. */
  sticky?: boolean;
  children?: ReactNode;
}

/**
 * Horizontal row of controls — results header, filter and sort rows, card
 * action strips. Give it an `aria-label` when it groups related controls.
 */
export function Toolbar({
  align = 'start',
  wrap = true,
  sticky,
  className,
  children,
  ...rest
}: ToolbarProps) {
  const cls = [
    'toolbar',
    align === 'between' && 'toolbar--between',
    align === 'end' && 'toolbar--end',
    wrap && 'toolbar--wrap',
    sticky && 'toolbar--sticky',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div {...rest} className={cls}>
      {children}
    </div>
  );
}

/** Pushes the toolbar items after it to the trailing edge. */
export function ToolbarSpacer() {
  return <span className="toolbar__spacer" aria-hidden="true" />;
}
