import { useState } from 'react';
import { Icon } from '../../../../../shared/ui/Icon';
import { useI18n } from '../../../../../i18n';
import { useUpdateClubMutation } from '../../../../clubs';
import type { Club } from '../../../../clubs';
import { useStaffAction } from '../../../model/useStaffAction';

export function EditClubModal({ club, onDone }: { club: Club; onDone: () => void }) {
  const { t } = useI18n();
  const updateClub = useUpdateClubMutation(club.id);
  const { run } = useStaffAction(onDone);
  const [form, setForm] = useState({
    name: club.name,
    address: club.address ?? '',
    description: club.description ?? '',
    phone: club.phone ?? '',
    email: club.email ?? '',
  });

  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <div>
      <div className="field">
        <label>{t('label_name')}</label>
        <input value={form.name} onChange={set('name')} />
      </div>
      <div className="field">
        <label>{t('label_address')}</label>
        <input value={form.address} onChange={set('address')} />
      </div>
      <div className="field">
        <label>{t('label_description')}</label>
        <input value={form.description} onChange={set('description')} />
      </div>
      <div className="field">
        <div className="row2">
          <div>
            <label>{t('phone')}</label>
            <input value={form.phone} onChange={set('phone')} />
          </div>
          <div>
            <label>{t('email')}</label>
            <input value={form.email} onChange={set('email')} />
          </div>
        </div>
      </div>
      <button
        className="btn btn--primary btn--block"
        disabled={updateClub.isPending}
        onClick={() => void run(() => updateClub.mutateAsync(form), t('club_updated'))}
      >
        <Icon name="check" />
        {t('save_changes')}
      </button>
    </div>
  );
}
