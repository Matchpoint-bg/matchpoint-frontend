import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { Shell } from '../components/Shell';
import { EmptyState } from '../components/States';
import { useI18n } from '../i18n';

/** Bad URLs used to redirect silently to /clubs, which hid typos and broken links. */
export function NotFoundPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <Shell active="clubs">
      <EmptyState title={t('notfound_title')} desc={t('notfound_desc')} icon="info">
        <button className="btn btn--primary" style={{ marginTop: 6 }} onClick={() => navigate('/clubs')}>
          <Icon name="ball" />
          {t('go_to_clubs')}
        </button>
      </EmptyState>
    </Shell>
  );
}
