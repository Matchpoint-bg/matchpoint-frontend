import { useI18n } from '../../../i18n';
import { Icon } from '../Icon';
import styles from './ErrorState.module.css';

export function ErrorState({ msg, onRetry }: { msg?: string; onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="empty">
      <Icon name="info" />
      <h3>{t('couldnt_load')}</h3>
      <p>{msg}</p>
      <button className={`btn btn--soft btn--sm ${styles.retry}`} onClick={onRetry}>
        {t('retry')}
      </button>
      <p className="small-note">{t('try_backend_note')}</p>
    </div>
  );
}
