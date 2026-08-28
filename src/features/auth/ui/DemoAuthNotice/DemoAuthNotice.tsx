import { useI18n } from '../../../../i18n';
import styles from './DemoAuthNotice.module.css';

export function DemoAuthNotice() {
  const { t } = useI18n();

  return (
    <div className={styles.notice}>
      <span className="demo-flag">DEMO</span>
      <div className={styles.text}>
        <b>{t('demo_explore')}</b>
        <small>{t('demo_explore_desc')}</small>
      </div>
    </div>
  );
}
