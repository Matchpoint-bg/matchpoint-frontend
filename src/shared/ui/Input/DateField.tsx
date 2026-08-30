import { forwardRef } from 'react';
import { Input } from './Input';
import type { InputProps } from './Input';

export type DateFieldProps = Omit<InputProps, 'type' | 'icon'> & { icon?: InputProps['icon'] };

/**
 * Date input preset. Pass `min` to keep past dates unselectable — the search
 * flow relies on that rather than on validation alone.
 */
export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(function DateField(
  { icon = 'calendar', ...rest },
  ref,
) {
  return <Input {...rest} ref={ref} type="date" icon={icon} />;
});
