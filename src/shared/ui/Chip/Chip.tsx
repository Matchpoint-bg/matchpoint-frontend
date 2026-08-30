import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';

export type ChipVariant = 'default' | 'ghost' | 'clay' | 'grass' | 'hard' | 'indoor' | 'lit';

const VARIANT_CLASS: Record<ChipVariant, string> = {
  default: '',
  ghost: 'chip--ghost',
  clay: 'chip--clay',
  grass: 'chip--grass',
  hard: 'chip--hard',
  indoor: 'chip--indoor',
  lit: 'chip--lit',
};

interface ChipOwnProps {
  variant?: ChipVariant;
  icon?: IconName;
  className?: string;
  children?: ReactNode;
}

type StaticChipProps = ChipOwnProps & { onClick?: never; selected?: never } & Omit<
    HTMLAttributes<HTMLSpanElement>,
    'onClick'
  >;

type FilterChipProps = ChipOwnProps & {
  onClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  /** Toggled state — also announced via `aria-pressed`, so state is not colour-only. */
  selected?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

export type ChipProps = StaticChipProps | FilterChipProps;

/**
 * Label chip built on the global `.chip` classes. Passing `onClick` turns it
 * into a real toggle button (`FilterChip` is an alias for that usage).
 */
export function Chip(props: ChipProps) {
  const {
    variant = 'default',
    icon,
    className,
    children,
    selected,
    ...rest
  } = props as ChipOwnProps & { selected?: boolean } & Record<string, unknown>;
  const iconEl = icon ? <Icon name={icon} aria-hidden="true" focusable="false" /> : null;

  if (typeof rest.onClick === 'function') {
    const buttonRest = rest;
    const cls = ['chip', 'chip--btn', VARIANT_CLASS[variant], selected && 'chip--on', className]
      .filter(Boolean)
      .join(' ');
    return (
      <button
        type="button"
        {...(buttonRest as ButtonHTMLAttributes<HTMLButtonElement>)}
        className={cls}
        aria-pressed={selected ?? false}
      >
        {iconEl}
        {children}
      </button>
    );
  }

  const cls = ['chip', VARIANT_CLASS[variant], className].filter(Boolean).join(' ');
  return (
    <span {...(rest as HTMLAttributes<HTMLSpanElement>)} className={cls}>
      {iconEl}
      {children}
    </span>
  );
}

/** Explicit name for the interactive form, used by results/availability filters. */
export const FilterChip = Chip as (props: FilterChipProps) => JSX.Element;

/**
 * Layout row for chips — the global `.chiprow`. Pass `role="group"` with an
 * `aria-label` when the row is a set of related filters.
 */
export function ChipRow({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div {...rest} className={['chiprow', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
