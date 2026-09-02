import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { useAuth } from '../../features/auth';
import { ChangePasswordModal, EditProfileModal } from '../../features/profile';
import { useI18n } from '../../i18n';
import { Icon, Seam } from '../../shared/ui/Icon';
import { useModal } from '../../shared/ui/Modal';
import { useToast } from '../../shared/ui/Toast';
import styles from './ProfilePage.module.css';

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-cell">
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}

export function ProfilePage() {
  const { t } = useI18n();
  const { user, logout, isStaff } = useAuth();
  const { openModal } = useModal();
  const { toast } = useToast();
  const navigate = useNavigate();

  const dash = '—';
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

  return (
    <AppShell active="profile">
      <div className="detail-hero">
        <Seam />
        <div className="hero__glow" />
        <div className={`hero__eyebrow ${styles.eyebrow}`}>{t('account')}</div>
        <h1>{fullName}</h1>
        <div className="meta">
          <span>
            <Icon name="mail" />
            {user?.email || dash}
          </span>
          {user?.phone_number && (
            <span>
              <Icon name="phone" />
              {user.phone_number}
            </span>
          )}
        </div>
      </div>

      <div className="info-grid">
        <InfoCell label={t('first_name')} value={user?.first_name || dash} />
        <InfoCell label={t('last_name')} value={user?.last_name || dash} />
        <InfoCell label={t('email')} value={user?.email || dash} />
        <InfoCell label={t('phone')} value={user?.phone_number || dash} />
        <InfoCell label={t('language')} value={user?.preferred_language || dash} />
        <InfoCell label={t('role')} value={isStaff ? t('club_staff') : t('player')} />
      </div>

      <div className={styles.actions}>
        <button
          className="btn btn--primary"
          onClick={() => openModal(t('edit_profile'), <EditProfileModal />)}
        >
          <Icon name="edit" />
          {t('edit_profile')}
        </button>
        <button
          className="btn btn--outline"
          onClick={() => openModal(t('change_password'), <ChangePasswordModal />)}
        >
          <Icon name="gear" />
          {t('change_password')}
        </button>
        <button className="btn btn--outline" onClick={() => navigate('/reservations')}>
          <Icon name="ticket" />
          {t('my_reservations')}
        </button>
        <button className="btn btn--outline" onClick={() => navigate('/settings')}>
          <Icon name="gear" />
          {t('settings')}
        </button>
        <button
          className="btn btn--danger"
          onClick={() => {
            logout();
            toast(t('signed_out'));
            navigate('/players', { replace: true });
          }}
        >
          <Icon name="logout" />
          {t('sign_out')}
        </button>
      </div>
    </AppShell>
  );
}
