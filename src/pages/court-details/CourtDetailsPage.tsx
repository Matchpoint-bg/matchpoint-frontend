import { useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { useAuth } from '../../features/auth';
import {
  AvailabilityDatePicker,
  AvailabilityLegend,
  BookingSummary,
  SlotGrid,
  useSlotSelection,
} from '../../features/booking';
import { CourtHero, useAvailabilityQuery, useCourtQuery } from '../../features/courts';
import { useSettings } from '../../features/preferences';
import { useI18n } from '../../i18n';
import { useToast } from '../../shared/ui/Toast';
import { useCreateReservationMutation } from '../../features/reservations';
import { fmt } from '../../shared/lib/format';
import { BackLink } from '../../shared/ui/BackLink';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { Icon } from '../../shared/ui/Icon';
import { Spinner } from '../../shared/ui/Spinner';
import styles from './CourtDetailsPage.module.css';

export function CourtDetailsPage() {
  const { id } = useParams();
  const courtId = Number(id);
  const { t, lang } = useI18n();
  const { authed } = useAuth();
  const { demo } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [params] = useSearchParams();

  const [date, setDate] = useState(() => {
    const requested = params.get('date');
    const today = fmt.isoDate(new Date());
    return requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) && requested >= today
      ? requested
      : today;
  });

  const courtQuery = useCourtQuery(courtId);
  const availabilityQuery = useAvailabilityQuery(courtId, date);
  const createReservation = useCreateReservationMutation();
  const court = {
    data: courtQuery.data,
    error: courtQuery.error?.message ?? null,
    loading: courtQuery.isPending,
    reload: () => void courtQuery.refetch(),
  };
  const slots = {
    data: availabilityQuery.data,
    error: availabilityQuery.error?.message ?? null,
    loading: availabilityQuery.isPending,
    reload: () => void availabilityQuery.refetch(),
  };
  const booking = createReservation.isPending;
  const list = slots.data ?? [];
  const selection = useSlotSelection(list, `${courtId}|${date}|${demo}`);

  async function doBook() {
    if (!selection.first || !selection.last || !court.data) return;
    // Browsing the grid is public; committing to a slot isn't. Send them back here after.
    if (!authed) {
      navigate('/login', { state: { from: location } });
      return;
    }
    const body = {
      court: court.data.id,
      start_datetime: selection.first.start,
      end_datetime: selection.last.end,
    };
    try {
      const created = await createReservation.mutateAsync({
        body,
        meta: { amt: selection.total, date },
      });
      toast(t('booked_toast'), 'ok');
      selection.clear();
      // POST /api/reservations/ answers with a serializer that omits the new id.
      // With one, the list can point straight at the new booking; without, it
      // simply opens on Upcoming.
      navigate(created?.id ? `/reservations?new=${created.id}` : '/reservations');
    } catch (err) {
      toast(err instanceof Error ? err.message : t('book_fail'), 'err');
    }
  }

  return (
    <AppShell active="clubs">
      <BackLink label={t('back')} onClick={() => navigate(-1)} />

      {court.loading && <Spinner />}
      {!court.loading && court.error && <ErrorState msg={court.error} onRetry={court.reload} />}

      {!court.loading && !court.error && !court.data && (
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

      {!court.loading && !court.error && court.data && (
        <>
          <CourtHero court={court.data} />

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
            selected={selection.selected}
            loading={slots.loading}
            error={slots.error}
            onToggle={selection.toggle}
            onRetry={slots.reload}
          />

          {selection.indices.length > 0 && selection.first && selection.last && (
            <BookingSummary
              first={selection.first}
              last={selection.last}
              count={selection.indices.length}
              total={selection.total}
              contiguous={selection.contiguous}
              authenticated={authed}
              pending={booking}
              onSubmit={() => void doBook()}
            />
          )}
        </>
      )}
    </AppShell>
  );
}
