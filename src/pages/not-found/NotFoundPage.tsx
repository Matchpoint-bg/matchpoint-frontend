import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { useI18n } from '../../i18n';
import { EmptyState } from '../../shared/ui/EmptyState';
import { Icon } from '../../shared/ui/Icon';
import styles from './NotFoundPage.module.css';

/** Keep bad URLs visible instead of hiding broken links behind a silent redirect. */
export function NotFoundPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <AppShell active="clubs">
      <EmptyState title={t('notfound_title')} desc={t('notfound_desc')} icon="info">
        <button
          className={`btn btn--primary ${styles.action}`}
          onClick={() => navigate('/players')}
        >
          <Icon name="ball" />
          {t('go_to_clubs')}
        </button>
      </EmptyState>
    </AppShell>
  );
}
