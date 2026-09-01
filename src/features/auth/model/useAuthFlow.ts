import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../../i18n';
import { useToast } from '../../../shared/ui/Toast';
import { intentPath, recallIntent } from '../../booking/model/bookingIntent';
import { useSettings } from '../../preferences/model/SettingsProvider';
import { authApi } from '../api/auth.api';
import { useAuth } from './AuthProvider';

export type AuthMode = 'login' | 'register';

interface AuthLocationState {
  from?: { pathname?: string; search?: string; hash?: string };
  /** Why the visitor was sent here — `booking` reframes the page (§10). */
  reason?: 'booking' | 'expired';
}

/**
 * Maps a server message onto something a person can act on. The API phrases a
 * taken address differently per version, so we match on the shape rather than
 * the exact sentence, and fall back to the raw message instead of swallowing it.
 */
function authErrorKey(message: string, mode: AuthMode): 'email_taken' | null {
  const lower = message.toLowerCase();
  if (mode !== 'register') return null;
  const taken = lower.includes('exist') || lower.includes('already') || lower.includes('вече');
  return lower.includes('email') || lower.includes('имейл') ? (taken ? 'email_taken' : null) : null;
}

export function useAuthFlow() {
  const { t } = useI18n();
  const { login, register } = useAuth();
  const { demo } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const state = location.state as AuthLocationState | null;
  const from = state?.from;
  // A remembered intent only matters when the router state was lost — an
  // external identity provider reloading the app is the case it covers.
  const recalled = from?.pathname ? null : recallIntent();
  const destination = from?.pathname
    ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
    : recalled
      ? intentPath(recalled)
      : '/players';
  const bookingContext = from?.pathname === '/book' || state?.reason === 'booking' || Boolean(recalled);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const fields = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<
      string,
      string
    >;

    if (mode === 'register' && (fields.password ?? '') !== (fields.password_confirm ?? '')) {
      setError(t('password_mismatch'));
      toast(t('password_mismatch'), 'err');
      setBusy(false);
      return;
    }

    try {
      if (mode === 'login') {
        await login(fields.email ?? '', fields.password ?? '');
      } else {
        await register({
          email: fields.email ?? '',
          password: fields.password ?? '',
          first_name: fields.first_name ?? '',
          last_name: fields.last_name ?? '',
          phone_number: fields.phone_number ?? '',
        });
      }
      toast(t('signed_in'), 'ok');
      navigate(destination, { replace: true });
    } catch (caught) {
      const raw = caught instanceof Error ? caught.message : t('signin_fail');
      const key = authErrorKey(raw, mode);
      const message = key ? t(key) : raw;
      setError(message);
      toast(message, 'err');
    } finally {
      setBusy(false);
    }
  }

  async function continueWithGoogle() {
    if (!demo) {
      window.location.href = authApi.googleUrl();
      return;
    }

    toast(t('google_demo_note'));
    try {
      await login('google@demo.bg', 'x');
      toast(t('signed_in'), 'ok');
      navigate(destination, { replace: true });
    } catch {
      setError(t('signin_fail'));
      toast(t('signin_fail'), 'err');
    }
  }

  return {
    mode,
    setMode: (next: AuthMode) => {
      setError(null);
      setMode(next);
    },
    busy,
    demo,
    error,
    bookingContext,
    submit,
    continueWithGoogle,
  };
}
