import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';
import styles from './Button.module.css';
import { buttonClassName } from './buttonClassName';
import type { ButtonSize, ButtonVariant } from './buttonClassName';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  children?: ReactNode;
}

/** forwardRef so it can act as a popover/menu trigger. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    block,
    loading = false,
    icon,
    iconPosition = 'start',
    disabled,
    className,
    type = 'button',
    children,
    ...rest
  },
  ref,
) {
  const iconEl = icon ? <Icon name={icon} aria-hidden="true" focusable="false" /> : null;

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={buttonClassName({ variant, size, block, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : iconPosition === 'start' && iconEl}
      {children}
      {!loading && iconPosition === 'end' && iconEl}
    </button>
  );
});
