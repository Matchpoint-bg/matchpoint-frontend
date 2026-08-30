import { Link } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { useAuth } from '../../features/auth';
import { PlayerSettings } from '../../features/preferences';
import { useI18n } from '../../i18n';
import { Card, CardTitle, Icon } from '../../shared/ui';
import { SectionHeader } from '../../shared/ui/SectionHeader';
import styles from './SettingsPage.module.css';

/**
 * Player settings only. Club management moved to the `/club` workspace (§7), so
 * the old player/staff tab pair is gone — what is left here is a way in.
 */
export function SettingsPage() {
  const { t } = useI18n();
  const { isStaff } = useAuth();

  return (
    <AppShell active="settings">
      <SectionHeader eyebrow={t('preferences')} title={t('settings')} />
      <PlayerSettings />
      {isStaff && (
        <Card padded className={styles.workspace}>
          <CardTitle icon="court">{t('club_workspace')}</CardTitle>
          <p className="small-note">{t('club_workspace_desc')}</p>
          <Link className="btn btn--outline btn--sm" to="/club">
            <Icon name="arrowRight" />
            {t('club_workspace_open')}
          </Link>
        </Card>
      )}
    </AppShell>
  );
}
