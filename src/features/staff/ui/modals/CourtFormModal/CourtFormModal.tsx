import { useState } from 'react';
import { Icon } from '../../../../../shared/ui/Icon';
import { ToggleRow } from '../../../../../shared/ui/Toggle';
import { useI18n } from '../../../../../i18n';
import { useSaveCourtMutation } from '../../../../courts';
import type { Court, Surface } from '../../../../courts';
import { useStaffAction } from '../../../model/useStaffAction';
import styles from '../StaffModal.module.css';

const SURFACES: Surface[] = ['Clay', 'Grass', 'Hard'];

interface CourtFormModalProps {
  court: Court | null;
  clubId: number | undefined;
  onDone: () => void;
}

export function CourtFormModal({ court, clubId, onDone }: CourtFormModalProps) {
  const { t } = useI18n();
  const saveCourt = useSaveCourtMutation();
  const { run } = useStaffAction(onDone);
  const [form, setForm] = useState({
    name: court?.name ?? '',
    surface_type: (court?.surface_type as Surface) ?? 'Clay',
    sport_type: court?.sport_type ?? 'Tennis',
    is_indoor: court?.is_indoor ?? false,
    is_lit: court?.is_lit ?? false,
  });
  const editing = court !== null;

  const submit = () =>
    run(
      () => saveCourt.mutateAsync({ court, body: { ...form, club_id: clubId } }),
      editing ? t('court_saved') : t('court_created'),
    );

  return (
    <div>
      <div className="field">
        <label>{t('court_name')}</label>
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Court 1 — Centre"
        />
      </div>
      <div className="field">
        <label>{t('surface')}</label>
        <select
          value={form.surface_type}
          onChange={(event) =>
            setForm((current) => ({ ...current, surface_type: event.target.value as Surface }))
          }
        >
          {SURFACES.map((surface) => <option key={surface} value={surface}>{surface}</option>)}
        </select>
      </div>
      <div className="field">
        <label>{t('sport')}</label>
        <select
          value={form.sport_type}
          onChange={(event) => setForm((current) => ({ ...current, sport_type: event.target.value }))}
        >
          <option value="Tennis">Tennis</option>
        </select>
      </div>
      <ToggleRow
        title={t('indoor')}
        checked={form.is_indoor}
        onChange={(value) => setForm((current) => ({ ...current, is_indoor: value }))}
      />
      <ToggleRow
        title={t('floodlit')}
        checked={form.is_lit}
        onChange={(value) => setForm((current) => ({ ...current, is_lit: value }))}
      />
      <button
        className={`btn btn--primary btn--block ${styles.submit}`}
        disabled={saveCourt.isPending}
        onClick={() => void submit()}
      >
        <Icon name="check" />
        {editing ? t('save_court') : t('create_court')}
      </button>
    </div>
  );
}
