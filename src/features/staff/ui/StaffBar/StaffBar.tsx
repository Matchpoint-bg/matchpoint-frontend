import { Icon } from '../../../../shared/ui/Icon';
import { useModal } from '../../../../shared/ui/Modal';
import { useI18n } from '../../../../i18n';
import { useAuth } from '../../../auth';
import type { Club } from '../../../clubs';
import { StaffBadge } from '../StaffBadge';
import styles from '../StaffActions.module.css';
import { CourtFormModal } from '../modals/CourtFormModal';
import { EditClubModal } from '../modals/EditClubModal';
import { EmployeesModal } from '../modals/EmployeesModal';
import { OpeningHoursModal } from '../modals/OpeningHoursModal';

export function StaffBar({ club, onChanged }: { club: Club; onChanged: () => void }) {
  const { t } = useI18n();
  const { isStaff } = useAuth();
  const { openModal } = useModal();
  if (!isStaff) return null;

  return (
    <div className={styles.bar}>
      <StaffBadge />
      <button
        className="btn btn--outline btn--sm"
        onClick={() =>
          openModal(t('edit_club'), <EditClubModal club={club} onDone={onChanged} />)
        }
      >
        <Icon name="edit" />
        {t('edit_club')}
      </button>
      <button
        className="btn btn--outline btn--sm"
        onClick={() =>
          openModal(
            t('add_opening_hours'),
            <OpeningHoursModal clubId={club.id} onDone={onChanged} />,
          )
        }
      >
        <Icon name="clock" />
        {t('add_opening_hours')}
      </button>
      <button
        className="btn btn--outline btn--sm"
        onClick={() => openModal(t('view_staff'), <EmployeesModal clubId={club.id} />)}
      >
        <Icon name="users" />
        {t('view_staff')}
      </button>
      <button
        className="btn btn--dark btn--sm"
        onClick={() =>
          openModal(
            t('new_court'),
            <CourtFormModal court={null} clubId={club.id} onDone={onChanged} />,
          )
        }
      >
        <Icon name="plus" />
        {t('new_court')}
      </button>
    </div>
  );
}
