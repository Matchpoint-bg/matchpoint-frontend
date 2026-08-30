import { forwardRef } from 'react';
import { Input } from './Input';
import type { InputProps } from './Input';

export type TimeFieldProps = Omit<InputProps, 'type' | 'icon'> & { icon?: InputProps['icon'] };

/** Time input preset. `step="1800"` gives the half-hour granularity slots use. */
export const TimeField = forwardRef<HTMLInputElement, TimeFieldProps>(function TimeField(
  { icon = 'clock', step = 1800, ...rest },
  ref,
) {
  return <Input {...rest} ref={ref} type="time" icon={icon} step={step} />;
});
