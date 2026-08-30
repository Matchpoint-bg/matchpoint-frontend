import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';
import { buttonClassName } from '../Button';
import type { ButtonSize, ButtonVariant } from '../Button';
import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconName;
  /** Required: an icon-only control has no visible text to name it. */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** forwardRef so it can act as a popover/menu trigger. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = 'outline', size = 'md', className, type = 'button', ...rest },
  ref,
) {
  const shape = `${styles.iconButton} ${size === 'sm' ? styles.sm : ''} ${className ?? ''}`.trim();

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={buttonClassName({ variant, size, className: shape })}
      aria-label={label}
      title={label}
    >
      <Icon name={icon} aria-hidden="true" focusable="false" />
    </button>
  );
});
