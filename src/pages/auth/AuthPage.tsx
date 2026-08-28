import { Link } from 'react-router-dom';
import {
  AuthForm,
  AuthLayout,
  AuthModeTabs,
  DemoAuthNotice,
  GoogleAuthButton,
  useAuthFlow,
} from '../../features/auth';
import { useI18n } from '../../i18n';
import styles from './AuthPage.module.css';

export function AuthPage() {
  const { t } = useI18n();
  const auth = useAuthFlow();

  return (
    <AuthLayout>
      <AuthModeTabs mode={auth.mode} onChange={auth.setMode} />

      <h2>{auth.mode === 'login' ? t('welcome_back') : t('join')}</h2>
      <p className="muted">
        {auth.mode === 'login' ? t('signin_sub') : t('register_sub')}
      </p>

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
