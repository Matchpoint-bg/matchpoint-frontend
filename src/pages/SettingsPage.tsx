import { useState } from 'react';
import { Icon } from '../components/Icons';
import { SectionHead, Shell } from '../components/Shell';
import { ToggleRow } from '../components/ToggleRow';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import type { Lang } from '../lib/store';

function CardTitle({ icon, children }: { icon: 'sun' | 'moon' | 'gear' | 'download'; children: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ color: 'var(--ball)' }}>
        <Icon name={icon} />
      </span>
      <b style={{ fontFamily: 'var(--display)', fontSize: 17 }}>{children}</b>
    </div>
  );
}

export function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { demo, setDemo, staff, setStaff, apiUrl, setApiUrl } = useSettings();
  const { toast } = useToast();
  const { available, promptInstall } = useInstallPrompt();

  const [urlDraft, setUrlDraft] = useState(apiUrl);

  return (
    <Shell active="settings">
      <SectionHead eyebrow={t('preferences')} title={t('settings')} />

      <div className="card card--pad">
        <CardTitle icon={theme === 'dark' ? 'moon' : 'sun'}>{t('appearance')}</CardTitle>
        <ToggleRow
          title={t('theme_label')}
          desc={t('theme_desc')}
          checked={theme === 'dark'}
          onChange={(v) => setTheme(v ? 'dark' : 'light')}
        />
        <div className="toggle">
          <div className="t">
            <b>{t('lang_settings')}</b>
            <small>{t('lang_settings_desc')}</small>
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              border: '1px solid var(--line-2)',
              background: 'var(--card)',
              fontWeight: 700,
              fontSize: 13,
              color: 'var(--ink)',
            }}
          >
            <option value="en">English</option>
            <option value="bg">Български</option>
          </select>
        </div>
      </div>

      <div className="card card--pad" style={{ marginTop: 16 }}>
        <CardTitle icon="gear">{t('backend_conn')}</CardTitle>
        <div className="field">
          <label>{t('api_url')}</label>
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="http://localhost:8000"
          />
        </div>
        <button
          className="btn btn--soft btn--sm"
          onClick={() => {
            const v = urlDraft.trim();
            if (v) {
              setApiUrl(v);
              toast(t('api_saved'), 'ok');
            }
          }}
        >
          <Icon name="check" />
          {t('save_url')}
        </button>
        <p className="small-note">
          {t('api_note')} <code>/api/token/</code>, <code>/api/clubs/</code>,{' '}
          <code>/api/courts/</code>, <code>/api/reservations/</code>.
        </p>
      </div>

      <div className="card card--pad" style={{ marginTop: 16 }}>
        <ToggleRow
          title={t('demo_mode')}
          desc={t('demo_mode_desc')}
          checked={demo}
          onChange={(v) => {
            setDemo(v);
            toast(v ? t('demo_on') : t('demo_off'));
          }}
        />
        <ToggleRow
          title={t('staff_view')}
          desc={t('staff_view_desc')}
          checked={staff}
          onChange={(v) => {
            setStaff(v);
            toast(v ? t('staff_on') : t('staff_off'));
          }}
        />
      </div>

      <div className="card card--pad" style={{ marginTop: 16 }}>
        <CardTitle icon="download">{t('install_app')}</CardTitle>
        <p className="small-note" style={{ marginTop: 0 }}>
          {t('install_desc')}
        </p>
        <button
          className="btn btn--dark"
          disabled={!available}
          onClick={async () => {
            if (await promptInstall()) toast(t('installing'), 'ok');
            else toast(t('use_menu_install'));
          }}
        >
          <Icon name="download" />
          {t('install_btn')}
        </button>
        {!available && <p className="small-note">{t('install_ios')}</p>}
      </div>
    </Shell>
  );
}
