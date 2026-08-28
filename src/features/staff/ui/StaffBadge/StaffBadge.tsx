import { Icon } from '../../../../shared/ui/Icon';
import { useI18n } from '../../../../i18n';

export function StaffBadge() {
  const { t } = useI18n();
  return <span className="staff-badge"><Icon name="gear" />{t('staff')}</span>;
}
