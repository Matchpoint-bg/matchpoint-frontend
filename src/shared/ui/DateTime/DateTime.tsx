import { useI18n } from '../../../i18n';
import { fmt } from '../../lib/format';

export type DateTimeVariant = 'time' | 'date' | 'dateLong' | 'weekday';

export interface DateTimeProps {
  /** ISO datetime string, as the API returns it. */
  value: string;
  variant?: DateTimeVariant;
  /** With `variant="time"`, renders "18:00–19:30" from `value` to `end`. */
  end?: string;
  className?: string;
}

/**
 * Renders a semantic <time> element. All formatting comes from `fmt`
 * (src/shared/lib/format.ts), which stays the single source for date output.
 */
export function DateTime({ value, variant = 'time', end, className }: DateTimeProps) {
  const { lang } = useI18n();

  const format = (iso: string) => {
    if (variant === 'date') return `${fmt.dayNum(iso)} ${fmt.mon(iso, lang)}`;
    if (variant === 'dateLong') return fmt.dateLong(iso, lang);
    if (variant === 'weekday') return fmt.weekday(iso, lang);
    return fmt.time(iso);
  };

  if (end && variant === 'time') {
    return (
      <span className={className}>
        <time dateTime={value}>{format(value)}</time>
        {'–'}
        <time dateTime={end}>{format(end)}</time>
      </span>
    );
  }

  return (
    <time className={className} dateTime={value}>
      {format(value)}
    </time>
  );
}
