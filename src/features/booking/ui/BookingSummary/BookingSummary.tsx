import type { Slot } from '../../../courts';
import { useI18n } from '../../../../i18n';
import { fmt } from '../../../../shared/lib/format';
import { Button } from '../../../../shared/ui';
import styles from './BookingSummary.module.css';

/**
 * What the CTA commits to: `continue` hands off to the review page, `book` and
 * `reschedule` write to the API directly.
 */
export type BookingAction = 'continue' | 'book' | 'reschedule';

interface BookingSummaryProps {
  courtName?: string;
  first: Slot;
  last: Slot;
  minutes: number;
  total: number;
  authenticated: boolean;
  action: BookingAction;
  pending: boolean;
  onSubmit: () => void;
  onClear?: () => void;
}

/**
 * What the player has picked, and the way out of the page.
 *
 * One component, two shells (ToDoRedesign §9): a bottom bar pinned above the
 * mobile tab bar, and a sticky side card from the desktop breakpoint up. It is
 * deliberately not a `Sheet` — a modal would trap focus and stop the player
 * from adjusting the very selection it is summarising.
 *
 * Selection is always contiguous by construction (`useSlotSelection` corrects
 * gaps), so there is no invalid state to warn about here.
 */
export function BookingSummary({
  courtName,
  first,
  last,
  minutes,
  total,
  authenticated,
  action,
  pending,
  onSubmit,
  onClear,
}: BookingSummaryProps) {
  const { t } = useI18n();
  const range = `${first._t || fmt.time(first.start)} – ${fmt.time(last.end)}`;

  return (
    <aside className={`book-summary ${styles.root}`} aria-label={t('your_selection')}>
      <div className="book-summary__in">
        <div className="book-summary__info">
          <b>{range}</b>
          <small>
            {courtName ? `${courtName} · ` : ''}
            {minutes} {t('minutes_short')}
          </small>
        </div>
        <div className={`price-tag ${styles.price}`}>{fmt.money(total)}</div>
        <div className={styles.actions}>
          {onClear && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              {t('clear_selection')}
            </Button>
          )}
          <Button
            variant="primary"
            icon={action === 'continue' ? 'ticket' : authenticated ? 'check' : 'user'}
            disabled={pending}
            onClick={onSubmit}
          >
            {action === 'continue'
              ? t('continue_cta')
              : !authenticated
                ? t('sign_in')
                : pending
                  ? t('booking')
                  : action === 'reschedule'
                    ? t('confirm_reschedule')
                    : t('book')}
          </Button>
        </div>
      </div>
    </aside>
  );
}
