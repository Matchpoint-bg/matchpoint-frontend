import { useState } from 'react';
import { useAuth } from '../../../auth';
import { useI18n } from '../../../../i18n';
import { Icon } from '../../../../shared/ui/Icon';
import { useModal } from '../../../../shared/ui/Modal';
import { useToast } from '../../../../shared/ui/Toast';
import styles from '../ProfileModal.module.css';

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
  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  async function save() {
    setBusy(true);
    try {
      await updateProfile(form);
      toast(t('profile_saved'), 'ok');
      closeModal();
    } catch (error) {
      toast(error instanceof Error ? error.message : String(error), 'err');
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
      <div className={styles.actions}>
        <button className="btn btn--outline btn--block" onClick={closeModal} disabled={busy}>
          {t('cancel')}
        </button>
        <button className="btn btn--primary btn--block" onClick={() => void save()} disabled={busy}>
          <Icon name="check" />
          {busy ? t('please_wait') : t('save')}
        </button>
      </div>
    </div>
  );
}
