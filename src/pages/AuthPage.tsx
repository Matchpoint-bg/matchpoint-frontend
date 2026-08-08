import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { useI18n } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

type Mode = 'login' | 'register';

/** Where RequireAuth stashes the route the visitor was originally aiming for. */
interface FromState {
  from?: { pathname?: string };
}

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
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>('login');
  const [busy, setBusy] = useState(false);

  // Land back on the guarded page that bounced us here, not always on /clubs.
  const dest = (location.state as FromState | null)?.from?.pathname ?? '/clubs';

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;

    if (mode === 'register' && (f.password ?? '') !== (f.password_confirm ?? '')) {
      toast(t('password_mismatch'), 'err');
      setBusy(false);
      return;
    }

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
      navigate(dest, { replace: true });
    } catch (err) {
      toast(err instanceof Error ? err.message : t('signin_fail'), 'err');
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    if (demo) {
      toast(t('google_demo_note'));
      try {
        await login('google@demo.bg', 'x');
        toast(t('signed_in'), 'ok');
        navigate(dest, { replace: true });
      } catch {
        toast(t('signin_fail'), 'err');
      }
      return;
    }
    window.location.href = api.googleUrl();
  }

  return (
    <AuthLayout>
      <div className="authtabs" role="tablist">
        <button
          role="tab"
          aria-selected={mode === 'login'}
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >
          {t('sign_in')}
        </button>
        <button
          role="tab"
          aria-selected={mode === 'register'}
          className={mode === 'register' ? 'active' : ''}
          onClick={() => setMode('register')}
        >
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
                <label htmlFor="first_name">{t('first_name')}</label>
                <input id="first_name" name="first_name" required autoComplete="given-name" />
              </div>
              <div>
                <label htmlFor="last_name">{t('last_name')}</label>
                <input id="last_name" name="last_name" required autoComplete="family-name" />
              </div>
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="email">{t('email')}</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@club.bg"
          />
        </div>

        {mode === 'register' && (
          <div className="field">
            <label htmlFor="phone_number">{t('phone_opt')}</label>
            <input
              id="phone_number"
              name="phone_number"
              inputMode="tel"
              placeholder="+359…"
              autoComplete="tel"
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="password">{t('password')}</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={demo ? 1 : 8}
            placeholder="••••••••"
          />
        </div>

        {mode === 'register' && (
          <div className="field">
            <label htmlFor="password_confirm">{t('confirm_password')}</label>
            <input
              id="password_confirm"
              name="password_confirm"
              type="password"
              required
              autoComplete="new-password"
              minLength={demo ? 1 : 8}
              placeholder="••••••••"
            />
          </div>
        )}

        <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
          {busy ? t('please_wait') : mode === 'login' ? t('sign_in') : t('create_account')}
        </button>
      </form>

      {mode === 'login' && (
        <p style={{ textAlign: 'center', margin: '12px 0 0' }}>
          <Link className="backlink" to="/forgot-password">
            {t('forgot_password')}
          </Link>
        </p>
      )}

      <div className="divider">{t('or')}</div>

      <button className="btn btn--google" onClick={onGoogle}>
        <GoogleMark />
        {t('continue_google')}
      </button>

      <p className="small-note" style={{ textAlign: 'center' }}>
        {t('terms_note')}
      </p>
    </AuthLayout>
  );
}
