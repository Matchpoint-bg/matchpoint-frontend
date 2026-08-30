import { forwardRef } from 'react';
import type { ReactNode, SelectHTMLAttributes } from 'react';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Convenience alternative to writing <option> children by hand. */
  options?: SelectOption[];
  /** Leading icon inside the control. */
  icon?: IconName;
  /** Rendered as a disabled, empty-valued first option. */
  placeholder?: string;
  invalid?: boolean;
  wrapperClassName?: string;
  children?: ReactNode;
}

/**
 * Select over the global `.select` class. The native chevron is suppressed in
 * CSS and redrawn here so the control matches `Input` across browsers.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, icon, placeholder, invalid, className, wrapperClassName, children, ...rest },
  ref,
) {
  const cls = ['input', 'select', icon && 'input--icon', className].filter(Boolean).join(' ');

  return (
    <span className={['control', wrapperClassName].filter(Boolean).join(' ')}>
      {icon && <Icon name={icon} aria-hidden="true" focusable="false" />}
      <select
        {...rest}
        ref={ref}
        className={cls}
        aria-invalid={invalid || rest['aria-invalid'] ? true : undefined}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options?.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <span className="control__end">
        <Icon name="chevronDown" aria-hidden="true" focusable="false" />
      </span>
    </span>
  );
});
