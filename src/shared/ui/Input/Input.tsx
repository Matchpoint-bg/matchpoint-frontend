import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';

export type InputSize = 'md' | 'sm';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Leading icon inside the control. Decorative — label the field, not this. */
  icon?: IconName;
  inputSize?: InputSize;
  /** Forces the invalid look; `aria-invalid` from <Field> does it on its own. */
  invalid?: boolean;
  /** Trailing affordance — a clear button, a unit, a chevron. */
  endAdornment?: ReactNode;
  /** Applied to the wrapping `.control`, since the input itself is 100% wide. */
  wrapperClassName?: string;
}

/** Text input over the global `.input` class (src/styles/forms.css). */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon, inputSize = 'md', invalid, endAdornment, className, wrapperClassName, ...rest },
  ref,
) {
  const cls = [
    'input',
    icon && 'input--icon',
    endAdornment && 'input--end',
    inputSize === 'sm' && 'input--sm',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={['control', wrapperClassName].filter(Boolean).join(' ')}>
      {icon && <Icon name={icon} aria-hidden="true" focusable="false" />}
      <input
        {...rest}
        ref={ref}
        className={cls}
        aria-invalid={invalid || rest['aria-invalid'] ? true : undefined}
      />
      {endAdornment && <span className="control__end">{endAdornment}</span>}
    </span>
  );
});
