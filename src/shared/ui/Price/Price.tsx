import { useI18n } from '../../../i18n';
import { fmt } from '../../lib/format';

export interface PriceProps {
  value: number;
  /** Renders the "from X" qualifier used by club results. */
  from?: boolean;
  size?: 'md' | 'lg';
  className?: string;
}

/**
 * Money display. Formatting stays in `fmt.money` — this only owns the mono
 * `.price` presentation and the "from" qualifier.
 */
export function Price({ value, from, size = 'md', className }: PriceProps) {
  const { t } = useI18n();
  const cls = ['price', size === 'lg' && 'price--lg', className].filter(Boolean).join(' ');

  return (
    <span className={cls}>
      {from && <span className="price__from">{t('from')}</span>}
      {fmt.money(value)}
    </span>
  );
}
