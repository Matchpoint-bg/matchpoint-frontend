import { useModal } from '../../../../shared/ui/Modal';
import { useI18n } from '../../../../i18n';
import { useClubCourtsQuery } from '../../../clubs';
import { SurfaceBadge } from '../../../../shared/ui';
import { EmptyState } from '../../../../shared/ui/EmptyState';
import { ErrorState } from '../../../../shared/ui/ErrorState';
import { Icon } from '../../../../shared/ui/Icon';
import { Spinner } from '../../../../shared/ui/Spinner';
import { CourtFormModal } from '../modals/CourtFormModal';
import { DeleteCourtModal } from '../modals/DeleteCourtModal';
import { PricesModal } from '../modals/PricesModal';
import { UnavailabilityModal } from '../modals/UnavailabilityModal';
import styles from './CourtsManager.module.css';

export function CourtsManager({ clubId }: { clubId: number }) {
  const { t } = useI18n();
  const { openModal } = useModal();
  const courtsQuery = useClubCourtsQuery(clubId);
  const refresh = () => void courtsQuery.refetch();

  if (courtsQuery.isPending) return <Spinner />;
  if (courtsQuery.error) {
    return <ErrorState msg={courtsQuery.error.message} onRetry={refresh} />;
  }

  const courts = courtsQuery.data ?? [];
  return (
    <div>
      {courts.length === 0 && (
        <EmptyState
          title={t('no_courts_staff')}
          desc={t('courts_card_desc')}
          icon="court"
        />
      )}
      {courts.map((court) => (
        <div key={court.id} className="court-row">
          <div className="court-row__main">
            <b>{court.name}</b>
            <div className={`chiprow ${styles.chips}`}>
              <SurfaceBadge surface={court.surface_type} />
              <span className={`chip ${court.is_indoor ? 'chip--indoor' : 'chip--ghost'}`}>
                <Icon name="indoor" />
                {court.is_indoor ? t('indoor') : t('outdoor')}
              </span>
              {court.is_lit && (
                <span className="chip chip--lit">
                  <Icon name="bulb" />
                  {t('floodlit')}
                </span>
              )}
            </div>
          </div>
          <div className="court-row__actions">
            <button
              className="btn btn--outline btn--sm"
              onClick={() =>
                openModal(
                  t('edit_court'),
                  <CourtFormModal court={court} clubId={clubId} onDone={refresh} />,
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
              {t('prices')}
            </button>
            <button
              className="btn btn--outline btn--sm"
              onClick={() =>
                openModal(
                  t('block_court_time'),
                  <UnavailabilityModal courtId={court.id} onDone={refresh} />,
                )
              }
            >
              <Icon name="ban" />
              {t('block_time')}
            </button>
            <button
              className="btn btn--danger btn--sm"
              aria-label={t('delete_court')}
              title={t('delete_court')}
              onClick={() =>
                openModal(
                  `${t('delete_court')}?`,
                  <DeleteCourtModal court={court} onDeleted={refresh} />,
                )
              }
            >
              <Icon name="trash" />
            </button>
          </div>
        </div>
      ))}
      <button
        className={`btn btn--dark ${styles.add}`}
        onClick={() =>
          openModal(
            t('new_court'),
            <CourtFormModal court={null} clubId={clubId} onDone={refresh} />,
          )
        }
      >
        <Icon name="plus" />
        {t('new_court')}
      </button>
    </div>
  );
}
