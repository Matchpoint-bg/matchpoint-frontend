import { useState } from 'react';
import { Icon } from './Icons';
import { useI18n } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

const MIN_PASSWORD = 8;

export function EditProfileModal() {
  const { t } = useI18n();
  const { user, updateProfile } = useAuth();
  const { closeModal } = useModal();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    phone_number: user?.phone_number ?? '',
  });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    setBusy(true);
    try {
      await updateProfile(form);
      toast(t('profile_saved'), 'ok');
      closeModal();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'err');
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="field">
        <div className="row2">
          <div>
            <label htmlFor="pf-first">{t('first_name')}</label>
            <input id="pf-first" value={form.first_name} onChange={set('first_name')} />
          </div>
          <div>
            <label htmlFor="pf-last">{t('last_name')}</label>
            <input id="pf-last" value={form.last_name} onChange={set('last_name')} />
          </div>
        </div>
      </div>
      <div className="field">
        <label htmlFor="pf-phone">{t('phone')}</label>
        <input
          id="pf-phone"
          inputMode="tel"
          value={form.phone_number}
          onChange={set('phone_number')}
          placeholder="+359…"
        />
      </div>
      <p className="small-note">{t('email_readonly')}</p>

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button className="btn btn--outline btn--block" onClick={closeModal} disabled={busy}>
          {t('cancel')}
        </button>
        <button className="btn btn--primary btn--block" onClick={save} disabled={busy}>
          <Icon name="check" />
          {busy ? t('please_wait') : t('save')}
        </button>
      </div>
    </div>
  );
}

export function ChangePasswordModal() {
  const { t } = useI18n();
  const { closeModal } = useModal();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');

  async function save() {
    if (pw.length < MIN_PASSWORD) return setErr(t('password_too_short'));
    if (pw !== confirm) return setErr(t('password_mismatch'));
    setErr(null);
    setBusy(true);
    try {
      await api.changePassword(pw, confirm);
      toast(t('password_changed'), 'ok');
      closeModal();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
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
          value={pw}
          onChange={(e) => setPw(e.target.value)}
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
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      {err && (
        <p className="small-note" role="alert" style={{ color: 'var(--danger, #c0392b)' }}>
          {err}
        </p>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button className="btn btn--outline btn--block" onClick={closeModal} disabled={busy}>
          {t('cancel')}
        </button>
        <button className="btn btn--primary btn--block" onClick={save} disabled={busy}>
          <Icon name="check" />
          {busy ? t('please_wait') : t('save')}
        </button>
      </div>
    </div>
  );
}
