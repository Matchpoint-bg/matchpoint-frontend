import { useI18n } from '../../../i18n';

export function Spinner() {
  const { t } = useI18n();
  return <div className="spinner" role="status" aria-label={t('loading')} />;
}
