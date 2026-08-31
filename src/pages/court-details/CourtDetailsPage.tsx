import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import {
  AvailabilityDatePicker,
  AvailabilityLegend,
  BookingSummary,
  RescheduleNotice,
  SlotGrid,
  useBookSlots,
  useSlotSelection,
} from '../../features/booking';
import { CourtHero, useAvailabilityQuery, useCourtQuery } from '../../features/courts';
import { useSettings } from '../../features/preferences';
import { useI18n } from '../../i18n';
import { fmt } from '../../shared/lib/format';
import { BackLink } from '../../shared/ui/BackLink';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { Icon } from '../../shared/ui/Icon';
import { Spinner } from '../../shared/ui/Spinner';
import styles from './CourtDetailsPage.module.css';

/**
 * Single-court availability.
 *
 * As of ToDoRedesign §9 this is no longer part of the primary player flow —
 * booking happens on the club page. It survives only as the destination for
 * `/reservations` → reschedule, and retires in Phase 4 once that flow moves.
 */
export function CourtDetailsPage() {
  const { id } = useParams();
  const courtId = Number(id);
  const { t, lang } = useI18n();
  const { demo } = useSettings();
  const navigate = useNavigate();

  // `?reschedule=<id>` turns this screen into "pick a new time for that booking".
  const [params] = useSearchParams();
  const rescheduleParam = params.get('reschedule');
  const rescheduleId = rescheduleParam !== null ? Number(rescheduleParam) : null;
  const rescheduling = rescheduleId !== null && Number.isFinite(rescheduleId);

  const [date, setDate] = useState(() => {
    const requested = params.get('date');
    const today = fmt.isoDate(new Date());
    return requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) && requested >= today
      ? requested
      : today;
  });

  const courtQuery = useCourtQuery(courtId);
  const availabilityQuery = useAvailabilityQuery(courtId, date);
  const { book, authed, pending } = useBookSlots();

  const list = useMemo(() => availabilityQuery.data ?? [], [availabilityQuery.data]);
  const slotsByCourt = useMemo(() => new Map([[courtId, list]]), [courtId, list]);
  const selection = useSlotSelection(slotsByCourt, `${courtId}|${date}|${demo}`);

  const court = courtQuery.data;
  const courtError = courtQuery.error?.message ?? null;

  return (
    <AppShell active="clubs">
      <BackLink label={t('back')} onClick={() => navigate(-1)} />

      {courtQuery.isPending && <Spinner />}
      {!courtQuery.isPending && courtError && (
        <ErrorState msg={courtError} onRetry={() => void courtQuery.refetch()} />
      )}

      {!courtQuery.isPending && !courtError && !court && (
        <EmptyState title={t('court_missing_title')} desc={t('court_missing_desc')} icon="info">
          <button
            className={`btn btn--primary ${styles.emptyAction}`}
            onClick={() => navigate('/players')}
          >
            <Icon name="ball" />
            {t('go_to_clubs')}
          </button>
        </EmptyState>
      )}

      {!courtQuery.isPending && !courtError && court && (
        <>
          {rescheduling && (
            <RescheduleNotice onCancel={() => navigate('/reservations', { replace: true })} />
          )}

          <CourtHero court={court} />

          <div className={`section-head ${styles.availabilityHeading}`}>
            <div>
              <div className="eyebrow">{t('availability')}</div>
              <h2>{fmt.dateLong(`${date}T00:00:00`, lang)}</h2>
            </div>
          </div>

          <AvailabilityDatePicker date={date} onChange={setDate} />

          <AvailabilityLegend />

          <SlotGrid
            slots={list}
            isSelected={(index) => selection.isOn(courtId, index)}
            loading={availabilityQuery.isPending}
            error={availabilityQuery.error?.message ?? null}
            onToggle={(index) => selection.toggle(courtId, index)}
            onRetry={() => void availabilityQuery.refetch()}
          />

          {selection.first && selection.last && (
            <BookingSummary
              courtName={court.name}
              first={selection.first}
              last={selection.last}
              minutes={selection.minutes}
              total={selection.total}
              authenticated={authed}
              rescheduling={rescheduling}
              pending={pending}
              onClear={selection.clear}
              onSubmit={() =>
                void book({
                  courtId,
                  first: selection.first as NonNullable<typeof selection.first>,
                  last: selection.last as NonNullable<typeof selection.last>,
                  total: selection.total,
                  date,
                  rescheduleId: rescheduling ? rescheduleId : null,
                  onDone: selection.clear,
                })
              }
            />
          )}

          {selection.first && <div className={styles.barSpacer} aria-hidden="true" />}
        </>
      )}
    </AppShell>
  );
}
