/**
 * Button visuals live in the global `.btn` stylesheet (src/styles/buttons.css).
 * These helpers are the single place that knows the class names, so the
 * primitives (Button, LinkButton, IconButton) stay in sync.
 */

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'soft'
  | 'outline'
  | 'ghost'
  | 'dark'
  | 'danger'
  | 'google';

export type ButtonSize = 'md' | 'sm';

/** `secondary` is the design-system name for the existing `.btn--soft` look. */
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn--primary',
  secondary: 'btn--soft',
  soft: 'btn--soft',
  outline: 'btn--outline',
  ghost: 'btn--ghost',
  dark: 'btn--dark',
  danger: 'btn--danger',
  google: 'btn--google',
};

export interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
}

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  block,
  className,
}: ButtonClassOptions): string {
  return [
    'btn',
    VARIANT_CLASS[variant],
    size === 'sm' && 'btn--sm',
    block && 'btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}
