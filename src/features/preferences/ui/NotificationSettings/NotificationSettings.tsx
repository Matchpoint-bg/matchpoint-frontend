import { useState } from 'react';
import { useI18n } from '../../../../i18n';
import { store } from '../../../../shared/storage/store';
import type { NotifyKey } from '../../../../shared/storage/store';
import { CardTitle } from '../../../../shared/ui/CardTitle';
import { ToggleRow } from '../../../../shared/ui/Toggle';
import styles from './NotificationSettings.module.css';

export function NotificationSettings() {
  const { t } = useI18n();
  const [preferences, setPreferences] = useState<Record<NotifyKey, boolean>>(() => ({
    notifyConfirm: store.notify('notifyConfirm'),
    notifyRemind: store.notify('notifyRemind'),
    notifyCancel: store.notify('notifyCancel'),
  }));
  const set = (key: NotifyKey) => (value: boolean) => {
    store.setNotify(key, value);
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className={`card card--pad ${styles.card}`}>
      <CardTitle icon="bell">{t('notifications')}</CardTitle>
      <ToggleRow
        title={t('notify_confirm')}
        desc={t('notify_confirm_desc')}
        checked={preferences.notifyConfirm}
        onChange={set('notifyConfirm')}
      />
      <ToggleRow
        title={t('notify_remind')}
        desc={t('notify_remind_desc')}
        checked={preferences.notifyRemind}
        onChange={set('notifyRemind')}
      />
      <ToggleRow
        title={t('notify_cancel')}
        desc={t('notify_cancel_desc')}
        checked={preferences.notifyCancel}
        onChange={set('notifyCancel')}
      />
      <p className="small-note">{t('notify_inactive_note')}</p>
    </div>
  );
}
