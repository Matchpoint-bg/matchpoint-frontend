import { useNavigate } from 'react-router-dom';
import { Icon } from '../Icons';
import { useI18n } from '../../i18n';
import { useModal } from '../../context/ModalContext';
import { useSettings } from '../../context/SettingsContext';
import {
  CourtFormModal,
  DeleteCourtModal,
  EditClubModal,
  EmployeesModal,
  OpeningHoursModal,
  PricesModal,
  UnavailabilityModal,
} from './modals';
import type { Club, Court } from '../../types';

const BAR_STYLE = { display: 'flex', flexWrap: 'wrap', gap: 8, margin: '6px 0 4px' } as const;

function StaffBadge() {
  const { t } = useI18n();
  return (
    <span className="staff-badge">
      <Icon name="gear" />
      {t('staff')}
    </span>
  );
}

export function StaffBar({ club, onChanged }: { club: Club; onChanged: () => void }) {
  const { t } = useI18n();
  const { staff } = useSettings();
  const { openModal } = useModal();

  if (!staff) return null;

  return (
    <div style={BAR_STYLE}>
      <StaffBadge />
      <button
        className="btn btn--outline btn--sm"
        onClick={() => openModal(t('edit_club'), <EditClubModal club={club} onDone={onChanged} />)}
      >
        <Icon name="edit" />
        {t('edit_club')}
      </button>
      <button
        className="btn btn--outline btn--sm"
        onClick={() =>
          openModal(t('add_opening_hours'), <OpeningHoursModal clubId={club.id} onDone={onChanged} />)
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
          openModal(t('new_court'), <CourtFormModal court={null} clubId={club.id} onDone={onChanged} />)
        }
      >
        <Icon name="plus" />
        {t('new_court')}
      </button>
    </div>
  );
}

export function CourtStaffBar({ court, onChanged }: { court: Court; onChanged: () => void }) {
  const { t } = useI18n();
  const { staff } = useSettings();
  const { openModal } = useModal();
  const navigate = useNavigate();

  if (!staff) return null;

  return (
    <div style={{ ...BAR_STYLE, marginBottom: 16 }}>
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
          openModal(t('block_court_time'), <UnavailabilityModal courtId={court.id} onDone={onChanged} />)
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
              onDeleted={() => navigate(court.club_id ? `/clubs/${court.club_id}` : '/clubs')}
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
