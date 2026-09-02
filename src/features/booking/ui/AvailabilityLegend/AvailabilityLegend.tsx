import { useI18n } from '../../../../i18n';

export function AvailabilityLegend() {
  const { t } = useI18n();
  return (
    <div className="legend">
      <span><i className="lg-free" />{t('open')}</span>
      <span><i className="lg-sel" />{t('selected')}</span>
      <span><i className="lg-book" />{t('booked')}</span>
      <span><i className="lg-un" />{t('closed_legend')}</span>
    </div>
  );
}
