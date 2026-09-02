import { useState } from 'react';
import { useI18n } from '../../../../i18n';
import { TOOLS_ENABLED } from '../../../../shared/storage/store';
import { CardTitle } from '../../../../shared/ui/CardTitle';
import { Icon } from '../../../../shared/ui/Icon';
import { useToast } from '../../../../shared/ui/Toast';
import { ToggleRow } from '../../../../shared/ui/Toggle';
import { useSettings } from '../../model/SettingsProvider';
import styles from './DeveloperSettings.module.css';

export function DeveloperSettings() {
  const { t } = useI18n();
  const { demo, setDemo, staff, setStaff, apiUrl, setApiUrl } = useSettings();
  const { toast } = useToast();
  const [urlDraft, setUrlDraft] = useState(apiUrl);
  // Dev server or a demo build; never a real production bundle.
  if (!TOOLS_ENABLED) return null;

  function saveApiUrl() {
    const value = urlDraft.trim();
    if (!value) return;
    setApiUrl(value);
    toast(t('api_saved'), 'ok');
  }

  return (
    <>
      <div className={`card card--pad ${styles.card}`}>
        <CardTitle icon="gear">{t('backend_conn')}</CardTitle>
        <div className="field">
          <label htmlFor="api-url">{t('api_url')}</label>
          <input
            id="api-url"
            value={urlDraft}
            onChange={(event) => setUrlDraft(event.target.value)}
            placeholder="http://localhost:8000"
          />
        </div>
        <button className="btn btn--soft btn--sm" onClick={saveApiUrl}>
          <Icon name="check" />
          {t('save_url')}
        </button>
      </div>
      <div className={`card card--pad ${styles.card}`}>
        <ToggleRow
          title={t('demo_mode')}
          desc={t('demo_mode_desc')}
          checked={demo}
          onChange={(value) => {
            setDemo(value);
            toast(value ? t('demo_on') : t('demo_off'));
          }}
        />
        <ToggleRow
          title={t('staff_view')}
          desc={t('staff_view_desc')}
          checked={staff}
          onChange={(value) => {
            setStaff(value);
            toast(value ? t('staff_on') : t('staff_off'));
          }}
        />
      </div>
    </>
  );
}
