import { useState } from 'react';
import type { FormEvent, FormEventHandler } from 'react';
import { useI18n } from '../../../../i18n';
import { Button, Field, Input } from '../../../../shared/ui';
import type { AuthMode } from '../../model/useAuthFlow';

interface AuthFormProps {
  mode: AuthMode;
  demo: boolean;
  busy: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

type FieldName =
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'phone_number'
  | 'password'
  | 'password_confirm';

type Errors = Partial<Record<FieldName, string>>;

export function AuthForm({ mode, demo, busy, onSubmit }: AuthFormProps) {
  const { t } = useI18n();
  const [errors, setErrors] = useState<Errors>({});
  const minPassword = demo ? 1 : 8;

  /**
   * Validates before handing off, so problems are announced on the field that
   * caused them rather than only as a toast. Server errors stay with the flow.
   */
  const submit = (event: FormEvent<HTMLFormElement>) => {
    const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<
      string,
      string
    >;
    const next: Errors = {};

    if (mode === 'register') {
      if (!values.first_name?.trim()) next.first_name = t('field_required');
      if (!values.last_name?.trim()) next.last_name = t('field_required');
    }
    if (!values.email?.trim()) next.email = t('field_required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = t('email_invalid');

    if (!values.password) next.password = t('field_required');
    else if (values.password.length < minPassword) next.password = t('password_too_short');

    if (mode === 'register' && values.password !== values.password_confirm) {
      next.password_confirm = t('password_mismatch');
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      event.preventDefault();
      return;
    }

    onSubmit(event);
  };

  /** Clearing on change keeps a corrected field from staying flagged. */
  const clear = (name: FieldName) =>
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));

  return (
    <form onSubmit={submit} key={mode} noValidate>
      {mode === 'register' && (
        <div className="row2">
          <Field label={t('first_name')} htmlFor="first_name" required error={errors.first_name}>
            {(control) => (
              <Input
                {...control}
                name="first_name"
                autoComplete="given-name"
                onChange={() => clear('first_name')}
              />
            )}
          </Field>
          <Field label={t('last_name')} htmlFor="last_name" required error={errors.last_name}>
            {(control) => (
              <Input
                {...control}
                name="last_name"
                autoComplete="family-name"
                onChange={() => clear('last_name')}
              />
            )}
          </Field>
        </div>
      )}

      <Field label={t('email')} htmlFor="email" required error={errors.email}>
        {(control) => (
          <Input
            {...control}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@club.bg"
            onChange={() => clear('email')}
          />
        )}
      </Field>

      {mode === 'register' && (
        <Field label={t('phone_opt')} htmlFor="phone_number">
          {(control) => (
            <Input {...control} name="phone_number" inputMode="tel" placeholder="+359..." autoComplete="tel" />
          )}
        </Field>
      )}

      <Field label={t('password')} htmlFor="password" required error={errors.password}>
        {(control) => (
          <Input
            {...control}
            name="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={minPassword}
            placeholder="••••••••"
            onChange={() => clear('password')}
          />
        )}
      </Field>

      {mode === 'register' && (
        <Field
          label={t('confirm_password')}
          htmlFor="password_confirm"
          required
          error={errors.password_confirm}
        >
          {(control) => (
            <Input
              {...control}
              name="password_confirm"
              type="password"
              autoComplete="new-password"
              minLength={minPassword}
              placeholder="••••••••"
              onChange={() => clear('password_confirm')}
            />
          )}
        </Field>
      )}

      <Button type="submit" block loading={busy}>
        {busy ? t('please_wait') : mode === 'login' ? t('sign_in') : t('create_account')}
      </Button>
    </form>
  );
}
