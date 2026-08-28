import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout, authApi } from '../../features/auth';
import { useI18n } from '../../i18n';
import { useToast } from '../../shared/ui/Toast';
import styles from './ForgotPasswordPage.module.css';

export function ForgotPasswordPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const email = String(new FormData(e.currentTarget).get('email') ?? '');
    try {
      await authApi.requestPasswordReset(email);
      // Always report success: telling the visitor whether an address is registered would
      // turn this form into an account-enumeration oracle.
      setSent(true);
    } catch (err) {
      toast(err instanceof Error ? err.message : t('signin_fail'), 'err');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <div className="eyebrow">{t('reset_eyebrow')}</div>
      <h2>{sent ? t('reset_sent_title') : t('reset_title')}</h2>
      <p className="muted">{sent ? t('reset_sent_desc') : t('reset_desc')}</p>

      {!sent && (
        <form onSubmit={onSubmit}>
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
          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? t('please_wait') : t('send_reset_link')}
          </button>
        </form>
      )}

      <p className={styles.backLink}>
        <Link className="backlink" to="/login">
          {t('back_to_signin')}
        </Link>
      </p>
    </AuthLayout>
  );
}
