import { useState } from 'react';
import { useAuth } from '../../../auth';
import { ChangePasswordModal, EditProfileModal } from '../../../profile';
import { langToApi, useI18n } from '../../../../i18n';
import { useTheme } from '../../../../theme';
import { useInstallPrompt } from '../../../../shared/hooks/useInstallPrompt';
import type { Lang } from '../../../../shared/storage/store';
import { CardTitle } from '../../../../shared/ui/CardTitle';
import { Icon } from '../../../../shared/ui/Icon';
import { useModal } from '../../../../shared/ui/Modal';
import { useToast } from '../../../../shared/ui/Toast';
import { ToggleRow } from '../../../../shared/ui/Toggle';
import { DeveloperSettings } from '../DeveloperSettings';
import { NotificationSettings } from '../NotificationSettings';
import styles from './PlayerSettings.module.css';

export function PlayerSettings() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user, updateProfile } = useAuth();
  const { openModal } = useModal();
  const { toast } = useToast();
  const { available, promptInstall } = useInstallPrompt();
  const [savingLanguage, setSavingLanguage] = useState(false);

  async function changeLanguage(next: Lang) {
    const previous = lang;
    setLang(next);
    setSavingLanguage(true);
    try {
      await updateProfile({ preferred_language: langToApi(next) });
    } catch (error) {
      setLang(previous);
      toast(error instanceof Error ? error.message : t('lang_save_failed'), 'err');
    } finally {
      setSavingLanguage(false);
    }
  }

  async function installApp() {
    if (await promptInstall()) toast(t('installing'), 'ok');
    else toast(t('use_menu_install'));
  }

  return (
    <>
      <div className="card card--pad">
        <CardTitle icon="user">{t('account_card')}</CardTitle>
        <p className={`small-note ${styles.intro}`}>
          {t('signed_in_as')} <b>{user?.email}</b>
        </p>
        <div className={styles.actions}>
          <button
            className="btn btn--soft btn--sm"
            onClick={() => openModal(t('edit_profile'), <EditProfileModal />)}
          >
            <Icon name="edit" />
            {t('edit_profile')}
          </button>
          <button
            className="btn btn--soft btn--sm"
            onClick={() => openModal(t('change_password'), <ChangePasswordModal />)}
          >
            <Icon name="gear" />
            {t('change_password')}
          </button>
        </div>
      </div>

      <div className={`card card--pad ${styles.card}`}>
        <div className="toggle">
          <div className="t">
            <b>{t('lang_settings')}</b>
            <small>{t('lang_synced_note')}</small>
          </div>
          <select
            className={styles.select}
            value={lang}
            disabled={savingLanguage}
            aria-label={t('lang_settings')}
            onChange={(event) => void changeLanguage(event.target.value as Lang)}
          >
            <option value="en">English</option>
            <option value="bg">Български</option>
          </select>
        </div>
      </div>

      <div className={`card card--pad ${styles.card}`}>
        <CardTitle icon={theme === 'dark' ? 'moon' : 'sun'}>{t('device_card')}</CardTitle>
        <p className={`small-note ${styles.intro}`}>{t('device_card_desc')}</p>
        <ToggleRow
          title={t('theme_label')}
          desc={t('theme_desc')}
          checked={theme === 'dark'}
          onChange={(value) => setTheme(value ? 'dark' : 'light')}
        />
        <div className="toggle">
          <div className="t">
            <b>{t('install_app')}</b>
            <small>{available ? t('install_desc') : t('install_ios')}</small>
          </div>
          <button
            className="btn btn--dark btn--sm"
            disabled={!available}
            onClick={() => void installApp()}
          >
            <Icon name="download" />
            {t('install_btn')}
          </button>
        </div>
      </div>

      <NotificationSettings />
      <DeveloperSettings />
    </>
  );
}
