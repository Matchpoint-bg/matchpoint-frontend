import { Link } from 'react-router-dom';
import {
  AuthForm,
  AuthLayout,
  AuthModeTabs,
  DemoAuthNotice,
  GoogleAuthButton,
  useAuth,
  useAuthFlow,
} from '../../features/auth';
import { useI18n } from '../../i18n';
import styles from './AuthPage.module.css';

export function AuthPage() {
  const { t } = useI18n();
  const auth = useAuthFlow();
  const { sessionExpired } = useAuth();

  // Arriving mid-booking, this is a step in that flow, not a marketing page —
  // so it says what the account is for and what is waiting (§10).
  const title = sessionExpired
    ? t('session_expired_title')
    : auth.bookingContext
      ? t('auth_booking_title')
      : auth.mode === 'login'
        ? t('welcome_back')
        : t('join');
  const sub = sessionExpired
    ? t('session_expired_sub')
    : auth.bookingContext
      ? t('auth_booking_sub')
      : auth.mode === 'login'
        ? t('signin_sub')
        : t('register_sub');

  return (
    <AuthLayout>
      <AuthModeTabs mode={auth.mode} onChange={auth.setMode} />

      <h2>{title}</h2>
      <p className="muted">{sub}</p>

      {auth.error && (
        <p className={styles.error} role="alert">
          {auth.error}
        </p>
      )}

      {auth.demo && <DemoAuthNotice />}

      <AuthForm
        mode={auth.mode}
        demo={auth.demo}
        busy={auth.busy}
        onSubmit={(event) => void auth.submit(event)}
      />

      {auth.mode === 'login' && (
        <p className={styles.forgot}>
          <Link className="backlink" to="/forgot-password">
            {t('forgot_password')}
          </Link>
        </p>
      )}

      <div className="divider">{t('or')}</div>

      <GoogleAuthButton onClick={() => void auth.continueWithGoogle()} />

      <p className={`small-note ${styles.terms}`}>{t('terms_note')}</p>
    </AuthLayout>
  );
}
