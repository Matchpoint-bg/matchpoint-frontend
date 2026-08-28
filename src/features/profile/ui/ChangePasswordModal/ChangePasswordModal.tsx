import { useState } from 'react';
import { authApi } from '../../../auth';
import { useI18n } from '../../../../i18n';
import { Icon } from '../../../../shared/ui/Icon';
import { useModal } from '../../../../shared/ui/Modal';
import { useToast } from '../../../../shared/ui/Toast';
import styles from '../ProfileModal.module.css';

const MIN_PASSWORD = 8;

export function ChangePasswordModal() {
  const { t } = useI18n();
  const { closeModal } = useModal();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  async function save() {
    if (password.length < MIN_PASSWORD) return setError(t('password_too_short'));
    if (password !== confirm) return setError(t('password_mismatch'));
    setError(null);
    setBusy(true);
    try {
      await authApi.changePassword(password, confirm);
      toast(t('password_changed'), 'ok');
      closeModal();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="field">
        <label htmlFor="pw-new">{t('new_password')}</label>
        <input
          id="pw-new"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
        />
      </div>
      <div className="field">
        <label htmlFor="pw-confirm">{t('confirm_password')}</label>
        <input
          id="pw-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="••••••••"
        />
      </div>
      {error && (
        <p className={`small-note ${styles.error}`} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <button
          className="btn btn--outline btn--block"
          onClick={closeModal}
          disabled={busy}
        >
          {t('cancel')}
        </button>
        <button
          className="btn btn--primary btn--block"
          onClick={() => void save()}
          disabled={busy}
        >
          <Icon name="check" />
          {busy ? t('please_wait') : t('save')}
        </button>
      </div>
    </div>
  );
}
