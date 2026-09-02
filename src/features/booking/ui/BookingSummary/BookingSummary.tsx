import type { Slot } from '../../../courts';
import { useI18n } from '../../../../i18n';
import { fmt } from '../../../../shared/lib/format';
import { Icon } from '../../../../shared/ui/Icon';
import styles from './BookingSummary.module.css';

interface BookingSummaryProps {
  first: Slot;
  last: Slot;
  count: number;
  total: number;
  contiguous: boolean;
  authenticated: boolean;
  rescheduling: boolean;
  pending: boolean;
  onSubmit: () => void;
}

export function BookingSummary(props: BookingSummaryProps) {
  const { t } = useI18n();
  return (
    <div className="book-summary">
      <div className="book-summary__in">
        <div className="book-summary__info">
          <b>
            {props.first._t || fmt.time(props.first.start)} - {fmt.time(props.last.end)}
          </b>
          <small>
            {props.count}
            {t('min30')}
            {props.contiguous ? '' : t('consecutive_hint')}
          </small>
        </div>
        <div className={`price-tag ${styles.price}`}>{fmt.money(props.total)}</div>
        <button
          className="btn btn--primary"
          disabled={!props.contiguous || props.pending}
          onClick={props.onSubmit}
        >
          <Icon name={props.authenticated ? 'check' : 'user'} />
          {!props.authenticated
            ? t('sign_in')
            : props.pending
              ? t('booking')
              : props.rescheduling
                ? t('confirm_reschedule')
                : t('book')}
        </button>
      </div>
    </div>
  );
}
