import { useState } from 'react';
import { Icon } from '../components/Icons';
import { SectionHead, Shell } from '../components/Shell';
import { ToggleRow } from '../components/ToggleRow';
import { EmptyState, ErrorState, Spinner } from '../components/States';
import { ChangePasswordModal, EditProfileModal } from '../components/ProfileModals';
import { OpeningHoursEditor } from '../components/settings/OpeningHoursEditor';
import { CourtsManager } from '../components/settings/CourtsManager';
import { langToApi, useI18n } from '../i18n';
import { useTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { api } from '../lib/api';
import { store } from '../lib/store';
import type { Lang, NotifyKey } from '../lib/store';

type SettingsTab = 'player' | 'staff';

const SELECT_STYLE = {
  padding: '8px 12px',
  borderRadius: 999,
  border: '1px solid var(--line-2)',
  background: 'var(--card)',
  fontWeight: 700,
  fontSize: 13,
  color: 'var(--ink)',
} as const;

function CardTitle({
  icon,
  children,
}: {
  icon: 'sun' | 'moon' | 'gear' | 'download' | 'user' | 'clock' | 'court' | 'bell';
  children: string;
}) {
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
  const { t } = useI18n();
  const { isStaff } = useAuth();
  const [tab, setTab] = useState<SettingsTab>('player');

  // With no staff tab there is nothing to switch between, so the strip is omitted entirely
  // rather than rendered as a single lonely tab.
  const active = isStaff ? tab : 'player';

  return (
    <Shell active="settings">
      <SectionHead eyebrow={t('preferences')} title={t('settings')} />

      {isStaff && (
        <div className="authtabs" role="tablist" style={{ marginBottom: 18 }}>
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
    </Shell>
  );
}

/* ------------------------------- player ---------------------------------- */

function PlayerSettings() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user, updateProfile } = useAuth();
  const { openModal } = useModal();
  const { toast } = useToast();
  const { available, promptInstall } = useInstallPrompt();
  const [savingLang, setSavingLang] = useState(false);

  /**
   * Language is both a UI concern and an account field. Switch the UI first so the change
   * feels instant, then persist; on failure put it back rather than leave the two out of
   * step with each other.
   */
  async function changeLang(next: Lang) {
    const previous = lang;
    setLang(next);
    setSavingLang(true);
    try {
      await updateProfile({ preferred_language: langToApi(next) });
    } catch (e) {
      setLang(previous);
      toast(e instanceof Error ? e.message : t('lang_save_failed'), 'err');
    } finally {
      setSavingLang(false);
    }
  }

  return (
    <>
      <div className="card card--pad">
        <CardTitle icon="user">{t('account_card')}</CardTitle>
        <p className="small-note" style={{ marginTop: 0 }}>
          {t('signed_in_as')} <b>{user?.email}</b>
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
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

      <div className="card card--pad" style={{ marginTop: 16 }}>
        <div className="toggle">
          <div className="t">
            <b>{t('lang_settings')}</b>
            <small>{t('lang_synced_note')}</small>
          </div>
          <select
            value={lang}
            disabled={savingLang}
            aria-label={t('lang_settings')}
            onChange={(e) => void changeLang(e.target.value as Lang)}
            style={SELECT_STYLE}
          >
            <option value="en">English</option>
            <option value="bg">Български</option>
          </select>
        </div>
      </div>

      <div className="card card--pad" style={{ marginTop: 16 }}>
        <CardTitle icon={theme === 'dark' ? 'moon' : 'sun'}>{t('device_card')}</CardTitle>
        <p className="small-note" style={{ marginTop: 0 }}>
          {t('device_card_desc')}
        </p>
        <ToggleRow
          title={t('theme_label')}
          desc={t('theme_desc')}
          checked={theme === 'dark'}
          onChange={(v) => setTheme(v ? 'dark' : 'light')}
        />
        <div className="toggle">
          <div className="t">
            <b>{t('install_app')}</b>
            <small>{available ? t('install_desc') : t('install_ios')}</small>
          </div>
          <button
            className="btn btn--dark btn--sm"
            disabled={!available}
            onClick={async () => {
              if (await promptInstall()) toast(t('installing'), 'ok');
              else toast(t('use_menu_install'));
            }}
          >
            <Icon name="download" />
            {t('install_btn')}
          </button>
        </div>
      </div>

      <NotificationsCard />

      <DevCard />
    </>
  );
}

function NotificationsCard() {
  const { t } = useI18n();
  // Read once into state; the store is the source of truth but isn't reactive on its own.
  const [prefs, setPrefs] = useState<Record<NotifyKey, boolean>>(() => ({
    notifyConfirm: store.notify('notifyConfirm'),
    notifyRemind: store.notify('notifyRemind'),
    notifyCancel: store.notify('notifyCancel'),
  }));

  const set = (key: NotifyKey) => (v: boolean) => {
    store.setNotify(key, v);
    setPrefs((p) => ({ ...p, [key]: v }));
  };

  return (
    <div className="card card--pad" style={{ marginTop: 16 }}>
      <CardTitle icon="bell">{t('notifications')}</CardTitle>
      <ToggleRow
        title={t('notify_confirm')}
        desc={t('notify_confirm_desc')}
        checked={prefs.notifyConfirm}
        onChange={set('notifyConfirm')}
      />
      <ToggleRow
        title={t('notify_remind')}
        desc={t('notify_remind_desc')}
        checked={prefs.notifyRemind}
        onChange={set('notifyRemind')}
      />
      <ToggleRow
        title={t('notify_cancel')}
        desc={t('notify_cancel_desc')}
        checked={prefs.notifyCancel}
        onChange={set('notifyCancel')}
      />
      {/* The backend has no notification model or delivery path — say so rather than
          imply these switches do something today. */}
      <p className="small-note">{t('notify_inactive_note')}</p>
    </div>
  );
}

/** API base, demo mode and the staff override: developer controls, never in production. */
function DevCard() {
  const { t } = useI18n();
  const { demo, setDemo, staff, setStaff, apiUrl, setApiUrl } = useSettings();
  const { toast } = useToast();
  const [urlDraft, setUrlDraft] = useState(apiUrl);

  if (!import.meta.env.DEV) return null;

  return (
    <>
      <div className="card card--pad" style={{ marginTop: 16 }}>
        <CardTitle icon="gear">{t('backend_conn')}</CardTitle>
        <div className="field">
          <label htmlFor="api-url">{t('api_url')}</label>
          <input
            id="api-url"
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
    </>
  );
}

/* -------------------------------- staff ---------------------------------- */

function StaffSettings() {
  const { t } = useI18n();
  const { demo } = useSettings();
  const { data: clubs, error, loading, reload } = useAsync(() => api.clubs(), [demo]);

  // No endpoint reports which clubs a user works at, so the club is a stored choice.
  const [clubId, setClubIdState] = useState<number | null>(() => store.staffClub);
  const setClubId = (id: number | null) => {
    store.staffClub = id;
    setClubIdState(id);
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState msg={error} onRetry={reload} />;
  if (!clubs?.length) {
    return <EmptyState title={t('no_clubs_staff')} desc={t('staff_club_desc')} icon="info" />;
  }

  // A stored id can outlive the club it pointed at; fall back to the only club if there's one.
  const known = clubs.some((c) => c.id === clubId);
  const selected = known ? clubId : (clubs.length === 1 ? (clubs[0]?.id ?? null) : null);

  return (
    <>
      <div className="card card--pad">
        <CardTitle icon="gear">{t('staff_club_card')}</CardTitle>
        <div className="toggle">
          <div className="t">
            <b>{t('staff_club_desc')}</b>
          </div>
          <select
            value={selected ?? ''}
            aria-label={t('staff_club_card')}
            onChange={(e) => setClubId(e.target.value ? Number(e.target.value) : null)}
            style={SELECT_STYLE}
          >
            <option value="">—</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selected === null ? (
        <p className="small-note" style={{ marginTop: 16 }}>
          {t('select_club_first')}
        </p>
      ) : (
        <>
          <div className="card card--pad" style={{ marginTop: 16 }}>
            <CardTitle icon="clock">{t('hours_card')}</CardTitle>
            <p className="small-note" style={{ marginTop: 0 }}>
              {t('hours_card_desc')}
            </p>
            <OpeningHoursEditor clubId={selected} />
          </div>

          <div className="card card--pad" style={{ marginTop: 16 }}>
            <CardTitle icon="court">{t('courts_card')}</CardTitle>
            <p className="small-note" style={{ marginTop: 0 }}>
              {t('courts_card_desc')}
            </p>
            <CourtsManager clubId={selected} />
          </div>
        </>
      )}
    </>
  );
}
