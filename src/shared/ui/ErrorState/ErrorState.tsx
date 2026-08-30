import { useI18n } from '../../../i18n';
import { Button } from '../Button';
import { Icon } from '../Icon';
import styles from './ErrorState.module.css';

export function ErrorState({ msg, onRetry }: { msg?: string; onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="empty" role="alert">
      <Icon name="info" />
      <h3>{t('couldnt_load')}</h3>
      <p>{msg}</p>
      <Button variant="secondary" size="sm" className={styles.retry} onClick={onRetry}>
        {t('retry')}
      </Button>
      <p className="small-note">{t('try_backend_note')}</p>
    </div>
  );
}
