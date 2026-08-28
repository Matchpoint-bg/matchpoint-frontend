import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthLayout, authApi } from '../../features/auth';
import { useI18n } from '../../i18n';
import { useToast } from '../../shared/ui/Toast';
import styles from './ResetPasswordPage.module.css';

const MIN_PASSWORD = 8;

/**
 * Target of the link in Django's password-reset email. Because routing is hash-based, the
 * email template must point at `<site>/#/reset-password/<uid>/<token>`.
 */
export function ResetPasswordPage() {
  const { uid, token } = useParams();
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const pw = f.password ?? '';
    const confirm = f.password_confirm ?? '';

    if (pw.length < MIN_PASSWORD) return setErr(t('password_too_short'));
    if (pw !== confirm) return setErr(t('password_mismatch'));
    setErr(null);

    setBusy(true);
    try {
      await authApi.confirmPasswordReset(uid ?? '', token ?? '', pw, confirm);
      toast(t('password_changed'), 'ok');
      navigate('/login', { replace: true });
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : t('reset_link_invalid'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <div className="eyebrow">{t('reset_eyebrow')}</div>
      <h2>{t('set_new_password')}</h2>
      <p className="muted">{t('choose_new_desc')}</p>

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="password">{t('new_password')}</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={MIN_PASSWORD}
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>
        <div className="field">
          <label htmlFor="password_confirm">{t('confirm_password')}</label>
          <input
            id="password_confirm"
            name="password_confirm"
            type="password"
            required
            minLength={MIN_PASSWORD}
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>

        {err && (
          <p className={`small-note ${styles.error}`} role="alert">
            {err}
          </p>
        )}

        <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
          {busy ? t('please_wait') : t('set_new_password')}
        </button>
      </form>

      <p className={styles.backLink}>
        <Link className="backlink" to="/login">
          {t('back_to_signin')}
        </Link>
      </p>
    </AuthLayout>
  );
}
