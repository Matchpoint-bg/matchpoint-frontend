import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../../shared/ui/Icon';
import { useModal } from '../../../../shared/ui/Modal';
import { useI18n } from '../../../../i18n';
import { useAuth } from '../../../auth';
import type { Court } from '../../../courts';
import styles from '../StaffActions.module.css';
import { StaffBadge } from '../StaffBadge';
import { CourtFormModal } from '../modals/CourtFormModal';
import { DeleteCourtModal } from '../modals/DeleteCourtModal';
import { PricesModal } from '../modals/PricesModal';
import { UnavailabilityModal } from '../modals/UnavailabilityModal';

interface CourtStaffBarProps {
  court: Court;
  onChanged: () => void;
}

export function CourtStaffBar({ court, onChanged }: CourtStaffBarProps) {
  const { t } = useI18n();
  const { isStaff } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();
  if (!isStaff) return null;

  return (
    <div className={`${styles.bar} ${styles.courtBar}`}>
      <StaffBadge />
      <button
        className="btn btn--outline btn--sm"
        onClick={() =>
          openModal(
            t('edit_court'),
            <CourtFormModal court={court} clubId={court.club_id} onDone={onChanged} />,
          )
        }
      >
        <Icon name="edit" />
        {t('edit_court')}
      </button>
      <button
        className="btn btn--outline btn--sm"
        onClick={() => openModal(t('set_prices'), <PricesModal courtId={court.id} />)}
      >
        <Icon name="tag" />
        {t('set_prices')}
      </button>
      <button
        className="btn btn--outline btn--sm"
        onClick={() =>
          openModal(
            t('block_court_time'),
            <UnavailabilityModal courtId={court.id} onDone={onChanged} />,
          )
        }
      >
        <Icon name="ban" />
        {t('block_time')}
      </button>
      <button
        className="btn btn--danger btn--sm"
        onClick={() =>
          openModal(
            `${t('delete_court')}?`,
            <DeleteCourtModal
              court={court}
              onDeleted={() =>
                navigate(court.club_id ? `/clubs/${court.club_id}` : '/clubs')
              }
            />,
          )
        }
      >
        <Icon name="trash" />
        {t('delete')}
      </button>
    </div>
  );
}
