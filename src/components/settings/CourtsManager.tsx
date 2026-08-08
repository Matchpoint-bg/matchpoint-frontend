import { Icon } from '../Icons';
import { SurfaceChip } from '../Chip';
import { EmptyState, ErrorState, Spinner } from '../States';
import {
  CourtFormModal,
  DeleteCourtModal,
  PricesModal,
  UnavailabilityModal,
} from '../staff/modals';
import { useI18n } from '../../i18n';
import { useModal } from '../../context/ModalContext';
import { useAsync } from '../../hooks/useAsync';
import { api } from '../../lib/api';

/**
 * Club-scoped entry point to the court modals. They already exist and are unchanged here —
 * previously they were only reachable by navigating to one court's booking page, which made
 * "add a court" and "fix the prices on all of them" needlessly slow.
 */
export function CourtsManager({ clubId }: { clubId: number }) {
  const { t } = useI18n();
  const { openModal } = useModal();
  const { data, error, loading, reload } = useAsync(() => api.clubCourts(clubId), [clubId]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState msg={error} onRetry={reload} />;

  return (
    <div>
      {data?.length === 0 && (
        <EmptyState title={t('no_courts_staff')} desc={t('courts_card_desc')} icon="court" />
      )}

      {data?.map((court) => (
        <div key={court.id} className="court-row">
          <div className="court-row__main">
            <b>{court.name}</b>
            <div className="chiprow" style={{ marginTop: 6 }}>
              <SurfaceChip surface={court.surface_type} />
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
                  <CourtFormModal court={court} clubId={clubId} onDone={reload} />,
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
                  <UnavailabilityModal courtId={court.id} onDone={reload} />,
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
                  <DeleteCourtModal court={court} onDeleted={reload} />,
                )
              }
            >
              <Icon name="trash" />
            </button>
          </div>
        </div>
      ))}

      <button
        className="btn btn--dark"
        style={{ marginTop: 12 }}
        onClick={() =>
          openModal(t('new_court'), <CourtFormModal court={null} clubId={clubId} onDone={reload} />)
        }
      >
        <Icon name="plus" />
        {t('new_court')}
      </button>
    </div>
  );
}
