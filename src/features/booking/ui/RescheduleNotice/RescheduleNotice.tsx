import { useI18n } from '../../../../i18n';

export function RescheduleNotice({ onCancel }: { onCancel: () => void }) {
  const { t } = useI18n();
  return (
    <div className="notice" role="status">
      <div><b>{t('rescheduling_title')}</b><small>{t('rescheduling_desc')}</small></div>
      <button className="btn btn--soft btn--sm" onClick={onCancel}>{t('cancel_reschedule')}</button>
    </div>
  );
}
