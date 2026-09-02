import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../../../i18n';
import { useToast } from '../../../shared/ui/Toast';
import { DEMO_BUILD } from '../../../shared/storage/store';
import { useSettings } from '../../preferences/model/SettingsProvider';
import { authApi } from '../api/auth.api';
import { useAuth } from './AuthProvider';

export type AuthMode = 'login' | 'register';

interface AuthLocationState {
  from?: { pathname?: string; search?: string; hash?: string };
}

export function useAuthFlow() {
  const { t } = useI18n();
  const { login, register } = useAuth();
  const { demo, setDemo } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [busy, setBusy] = useState(false);
  const from = (location.state as AuthLocationState | null)?.from;
  const destination = from?.pathname
    ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
    : '/players';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const fields = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<
      string,
      string
    >;

    if (mode === 'register' && (fields.password ?? '') !== (fields.password_confirm ?? '')) {
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
    } catch (error) {
      toast(error instanceof Error ? error.message : t('signin_fail'), 'err');
    } finally {
      setBusy(false);
    }
  }

  async function continueWithGoogle() {
    if (!demo && !DEMO_BUILD) {
      window.location.href = authApi.googleUrl();
      return;
    }

    // A demo-capable build must never fall through to an unfinished OAuth
    // endpoint because a stale developer preference disabled demo at runtime.
    if (!demo) setDemo(true);
    toast(t('google_demo_note'));
    try {
      await login('google@demo.bg', 'x');
      toast(t('signed_in'), 'ok');
      navigate(destination, { replace: true });
    } catch {
      toast(t('signin_fail'), 'err');
    }
  }

  return {
    mode,
    setMode,
    busy,
    demo,
    submit,
    continueWithGoogle,
  };
}
