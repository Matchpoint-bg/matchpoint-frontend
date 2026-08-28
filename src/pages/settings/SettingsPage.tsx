import { useState } from 'react';
import { AppShell } from '../../app/layout/AppShell';
import { useAuth } from '../../features/auth';
import { PlayerSettings } from '../../features/preferences';
import { StaffSettings } from '../../features/staff';
import { useI18n } from '../../i18n';
import { SectionHeader } from '../../shared/ui/SectionHeader';
import styles from './SettingsPage.module.css';

type SettingsTab = 'player' | 'staff';

export function SettingsPage() {
  const { t } = useI18n();
  const { isStaff } = useAuth();
  const [tab, setTab] = useState<SettingsTab>('player');
  const active = isStaff ? tab : 'player';

  return (
    <AppShell active="settings">
      <SectionHeader eyebrow={t('preferences')} title={t('settings')} />
      {isStaff && (
        <div className={`authtabs ${styles.tabs}`} role="tablist">
          <button
            role="tab"
            aria-selected={active === 'player'}
            className={active === 'player' ? 'active' : ''}
            onClick={() => setTab('player')}
          >
            {t('tab_player')}
          </button>
          <button
            role="tab"
            aria-selected={active === 'staff'}
            className={active === 'staff' ? 'active' : ''}
            onClick={() => setTab('staff')}
          >
            {t('tab_staff')}
          </button>
        </div>
      )}
      {active === 'player' ? <PlayerSettings /> : <StaffSettings />}
    </AppShell>
  );
}
