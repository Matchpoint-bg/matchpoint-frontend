import type { FormEventHandler } from 'react';
import { useI18n } from '../../../../i18n';
import type { AuthMode } from '../../model/useAuthFlow';

interface AuthFormProps {
  mode: AuthMode;
  demo: boolean;
  busy: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function AuthForm({ mode, demo, busy, onSubmit }: AuthFormProps) {
  const { t } = useI18n();

  return (
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
            placeholder="+359..."
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
  );
}
