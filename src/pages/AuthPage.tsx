import { useState } from 'react';
import type { FormEvent } from 'react';
import { Seam } from '../components/Icons';
import { ThemeLangToggles } from '../components/Shell';
import { useI18n } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

type Mode = 'login' | 'register';

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-7.9Z" />
      <path fill="#34A853" d="M12 23c2.9 0 5.3-1 7.1-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.5 1.1-2.7 0-5-1.8-5.9-4.3H2.4v2.8A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M6.1 14.5a6.6 6.6 0 0 1 0-4.2V7.5H2.4a11 11 0 0 0 0 9.8l3.7-2.8Z" />
      <path fill="#EA4335" d="M12 5.5c1.5 0 2.9.5 4 1.5l3-3A11 11 0 0 0 2.4 7.5l3.7 2.8C7 7.8 9.3 5.5 12 5.5Z" />
    </svg>
  );
}

export function AuthPage() {
  const { t } = useI18n();
  const { login, register } = useAuth();
  const { demo } = useSettings();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('login');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    try {
      if (mode === 'login') {
        await login(f.email ?? '', f.password ?? '');
      } else {
        await register({
          email: f.email ?? '',
          password: f.password ?? '',
          first_name: f.first_name ?? '',
          last_name: f.last_name ?? '',
          phone_number: f.phone_number ?? '',
        });
      }
      toast(t('signed_in'), 'ok');
    } catch (err) {
      toast(err instanceof Error ? err.message : t('signin_fail'), 'err');
      setBusy(false);
    }
  }

  async function onGoogle() {
    if (demo) {
      toast(t('google_demo_note'));
      try {
        await login('google@demo.bg', 'x');
        toast(t('signed_in'), 'ok');
      } catch {
        toast(t('signin_fail'), 'err');
      }
      return;
    }
    window.location.href = api.googleUrl();
  }

  return (
    <div className="auth-wrap">
      <div className="auth-brandside">
        <Seam />
        <div className="hero__glow" />

        <div className="b-top">
          <img className="b-mark" src="/icons/icon-192.png" alt="" />
          <span className="brand__tag" style={{ color: 'var(--leaf)' }}>
            {t('tap_hero')}
          </span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <ThemeLangToggles />
          </span>
        </div>

        <div>
          <h1>
            {t('hero_title1')}
            <br />
            <span>{t('hero_title2')}</span>
          </h1>
          <p className="lede">{t('hero_lede')}</p>
          <div className="pills">
            <span className="pill">{t('pill_live')}</span>
            <span className="pill">{t('pill_instant')}</span>
            <span className="pill">{t('pill_surfaces')}</span>
            <span className="pill">{t('pill_install')}</span>
          </div>
        </div>

        <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 12.5 }}>{t('powered_by')}</div>
      </div>

      <div className="auth-formside">
        <div className="auth-card">
          <div className="authtabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
              {t('sign_in')}
            </button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
              {t('create_account')}
            </button>
          </div>

          <h2>{mode === 'login' ? t('welcome_back') : t('join')}</h2>
          <p className="muted">{mode === 'login' ? t('signin_sub') : t('register_sub')}</p>

          {demo && (
            <div className="install" style={{ marginBottom: 18 }}>
              <span className="demo-flag">DEMO</span>
              <div className="t" style={{ color: '#fff' }}>
                <b style={{ fontSize: 14 }}>{t('demo_explore')}</b>
                <small>{t('demo_explore_desc')}</small>
              </div>
            </div>
          )}

          {/* Remounts on mode change so the browser clears fields that no longer apply. */}
          <form onSubmit={onSubmit} key={mode}>
            {mode === 'register' && (
              <div className="field">
                <div className="row2">
                  <div>
                    <label>{t('first_name')}</label>
                    <input name="first_name" required autoComplete="given-name" />
                  </div>
                  <div>
                    <label>{t('last_name')}</label>
                    <input name="last_name" required autoComplete="family-name" />
                  </div>
                </div>
              </div>
            )}

            <div className="field">
              <label>{t('email')}</label>
              <input name="email" type="email" required autoComplete="email" placeholder="you@club.bg" />
            </div>

            {mode === 'register' && (
              <div className="field">
                <label>{t('phone_opt')}</label>
                <input name="phone_number" inputMode="tel" placeholder="+359…" autoComplete="tel" />
              </div>
            )}

            <div className="field">
              <label>{t('password')}</label>
              <input
                name="password"
                type="password"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={demo ? 1 : 6}
                placeholder="••••••••"
              />
            </div>

            <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
              {busy ? t('please_wait') : mode === 'login' ? t('sign_in') : t('create_account')}
            </button>
          </form>

          <div className="divider">{t('or')}</div>

          <button className="btn btn--google" onClick={onGoogle}>
            <GoogleMark />
            {t('continue_google')}
          </button>

          <p className="small-note" style={{ textAlign: 'center' }}>
            {t('terms_note')}
          </p>
        </div>
      </div>
    </div>
  );
}
