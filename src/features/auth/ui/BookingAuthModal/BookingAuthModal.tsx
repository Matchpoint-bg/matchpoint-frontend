import { useState } from 'react';
import type { FormEvent } from 'react';
import { useI18n } from '../../../../i18n';
import { useToast } from '../../../../shared/ui';
import { DEMO_BUILD } from '../../../../shared/storage/store';
import { useSettings } from '../../../preferences';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../model/AuthProvider';
import type { AuthMode } from '../../model/useAuthFlow';
import { AuthForm } from '../AuthForm';
import { AuthModeTabs } from '../AuthModeTabs';
import { DemoAuthNotice } from '../DemoAuthNotice';
import { GoogleAuthButton } from '../GoogleAuthButton';
import styles from './BookingAuthModal.module.css';

interface AuthModalProps {
  onSuccess: () => void;
  description: string;
}

export function AuthModal({ onSuccess, description }: AuthModalProps) {
  const { t } = useI18n();
  const { login, register } = useAuth();
  const { demo, setDemo } = useSettings();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<
      string,
      string
    >;
    setBusy(true);
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
      onSuccess();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('signin_fail'), 'err');
    } finally {
      setBusy(false);
    }
  };

  const continueWithGoogle = async () => {
    if (!demo && !DEMO_BUILD) {
      // BookingIntent already lives in sessionStorage, so it survives the
      // external OAuth round trip once the backend callback is connected.
      window.location.href = authApi.googleUrl();
      return;
    }
    if (!demo) setDemo(true);
    setBusy(true);
    try {
      await login('google@demo.bg', 'x');
      toast(t('signed_in'), 'ok');
      onSuccess();
    } catch {
      toast(t('signin_fail'), 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.content}>
      <p className={styles.intro}>{description}</p>
      <AuthModeTabs mode={mode} onChange={setMode} />
      {demo && <DemoAuthNotice />}
      <AuthForm
        mode={mode}
        demo={demo}
        busy={busy}
        onSubmit={(event) => void submit(event)}
      />
      <div className="divider">{t('or')}</div>
      <GoogleAuthButton onClick={() => void continueWithGoogle()} />
      <p className={styles.terms}>{t('terms_note')}</p>
    </div>
  );
}

export function BookingAuthModal({ onSuccess }: Pick<AuthModalProps, 'onSuccess'>) {
  const { t } = useI18n();
  return <AuthModal onSuccess={onSuccess} description={t('account_needed_desc')} />;
}
