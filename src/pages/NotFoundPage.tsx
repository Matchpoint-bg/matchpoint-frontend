import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { Shell } from '../components/Shell';
import { EmptyState } from '../components/States';
import { useI18n } from '../i18n';
import { useAuth } from '../context/AuthContext';

/**
 * Bad URLs used to redirect silently to /clubs, which hid typos and broken links.
 * Signed-out visitors get the bare panel — Shell's nav would only lead to guarded routes.
 */
export function NotFoundPage() {
  const { t } = useI18n();
  const { authed } = useAuth();
  const navigate = useNavigate();

  const body = (
    <EmptyState title={t('notfound_title')} desc={t('notfound_desc')} icon="info">
      <button
        className="btn btn--primary"
        style={{ marginTop: 6 }}
        onClick={() => navigate(authed ? '/clubs' : '/login')}
      >
        <Icon name="ball" />
        {authed ? t('go_to_clubs') : t('sign_in')}
      </button>
    </EmptyState>
  );

  if (!authed) {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>{body}</div>;
  }
  return <Shell active="clubs">{body}</Shell>;
}
