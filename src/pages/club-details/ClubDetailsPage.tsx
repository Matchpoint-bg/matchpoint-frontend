import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import {
  ClubFacilities,
  ClubHero,
  OpeningHoursCard,
  summariseCourts,
  useClubCourtsQuery,
  useClubOpeningHoursQuery,
  useClubQuery,
} from '../../features/clubs';
import {
  AvailabilityDatePicker,
  AvailabilityFilters,
  AvailabilityLegend,
  BookingSummary,
  CourtAvailabilityCard,
  SelectionAnnouncer,
  useBookSlots,
  useClubAvailability,
  useSlotSelection,
} from '../../features/booking';
import type { CoverFilter } from '../../features/booking';
import { useSettings } from '../../features/preferences';
import { useI18n } from '../../i18n';
import { fmt } from '../../shared/lib/format';
import { BackLink } from '../../shared/ui/BackLink';
import { Card } from '../../shared/ui/Card';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { Icon } from '../../shared/ui/Icon';
import { SectionHeader } from '../../shared/ui/SectionHeader';
import { Spinner } from '../../shared/ui/Spinner';
import styles from './ClubDetailsPage.module.css';

/**
 * The club page is the booking page (ToDoRedesign §9): identity, then live
 * availability across every court for one date, then the reference material.
 * `/courts/:id` is no longer part of this flow.
 */
export function ClubDetailsPage() {
  const { id } = useParams();
  const clubId = Number(id);
  const { t, lang } = useI18n();
  const { demo } = useSettings();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.toString();
  const playersUrl = search ? `/players?${search}` : '/players';

  // The date lives in the URL, so the date chosen on /players survives the jump
  // here, and a change here survives a reload or a shared link.
  const today = fmt.isoDate(new Date());
  const requested = searchParams.get('date');
  const date = requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) && requested >= today
    ? requested
    : today;
  const setDate = (next: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('date', next);
    setSearchParams(params, { replace: true });
  };

  const clubQuery = useClubQuery(clubId);
  const courtsQuery = useClubCourtsQuery(clubId);
  const hoursQuery = useClubOpeningHoursQuery(clubId);

  const [surface, setSurface] = useState<string | null>(null);
  const [cover, setCover] = useState<CoverFilter>(null);

  const courts = useMemo(() => courtsQuery.data ?? [], [courtsQuery.data]);
  const summary = useMemo(() => summariseCourts(courts), [courts]);
  const visibleCourts = useMemo(
    () =>
      courts.filter((court) => {
        if (surface && court.surface_type !== surface) return false;
        if (cover === 'indoor' && !court.is_indoor) return false;
        if (cover === 'outdoor' && court.is_indoor) return false;
        return true;
      }),
    [courts, cover, surface],
  );

  const availability = useClubAvailability(visibleCourts, date);
  const slotsByCourt = useMemo(
    () => new Map(availability.map((entry) => [entry.court.id, entry.slots])),
    [availability],
  );
  // Filters change which courts are on screen, so a selection made under the
  // old filter has to go with it — same reason a date change clears it.
  const selection = useSlotSelection(slotsByCourt, `${clubId}|${date}|${demo}|${surface}|${cover}`);
  const { book, authed, pending } = useBookSlots();

  const loading = clubQuery.isPending || courtsQuery.isPending;
  const error = clubQuery.error ?? courtsQuery.error;
  const reload = () => {
    void Promise.all([clubQuery.refetch(), courtsQuery.refetch(), hoursQuery.refetch()]);
  };
  const selectedCourt = courts.find((court) => court.id === selection.courtId);

  return (
    <AppShell active="clubs">
      <BackLink label={t('all_clubs')} onClick={() => navigate(playersUrl)} />

      {loading && <Spinner />}
      {!loading && error && <ErrorState msg={error.message} onRetry={reload} />}

      {!loading && !error && !clubQuery.data && (
        <EmptyState title={t('club_missing_title')} desc={t('club_missing_desc')} icon="info">
          <button
            className={`btn btn--primary ${styles.emptyAction}`}
            onClick={() => navigate('/players')}
          >
            <Icon name="ball" />
            {t('go_to_clubs')}
          </button>
        </EmptyState>
      )}

      {!loading && !error && clubQuery.data && (
        <>
          <ClubHero club={clubQuery.data} summary={summary} />

          <ClubFacilities summary={summary} courts={courts} />

          <SectionHeader
            eyebrow={t('availability')}
            title={fmt.dateLong(`${date}T00:00:00`, lang)}
            sub={t('courts_sub')}
          />

          <AvailabilityDatePicker date={date} onChange={setDate} />

          <AvailabilityFilters
            surfaces={summary.surfaces}
            hasIndoor={summary.indoorCount > 0}
            hasOutdoor={summary.outdoorCount > 0}
            surface={surface}
            cover={cover}
            onSurfaceChange={setSurface}
            onCoverChange={setCover}
          />

          <AvailabilityLegend />

          <SelectionAnnouncer
            first={selection.first}
            last={selection.last}
            total={selection.total}
            courtName={selectedCourt?.name}
          />

          <div className={styles.availability} data-has-selection={selection.first ? 'true' : undefined}>
            <div className={styles.courts}>
              {courts.length === 0 && (
                <EmptyState title={t('no_courts_title')} desc={t('no_courts_desc')} icon="court" />
              )}
              {courts.length > 0 && visibleCourts.length === 0 && (
                <EmptyState
                  title={t('no_matching_courts_title')}
                  desc={t('no_matching_courts_desc')}
                  icon="court"
                />
              )}
              {availability.map(({ court, slots, loading: slotsLoading, error: slotsError, reload }) => (
                <CourtAvailabilityCard
                  key={court.id}
                  court={court}
                  slots={slots}
                  loading={slotsLoading}
                  error={slotsError}
                  isSelected={(index) => selection.isOn(court.id, index)}
                  onToggle={(index) => selection.toggle(court.id, index)}
                  onRetry={reload}
                />
              ))}
            </div>

            {selection.first && selection.last && selection.courtId !== null && (
              <div className={styles.summary}>
                <BookingSummary
                  courtName={selectedCourt?.name}
                  first={selection.first}
                  last={selection.last}
                  minutes={selection.minutes}
                  total={selection.total}
                  authenticated={authed}
                  rescheduling={false}
                  pending={pending}
                  onClear={selection.clear}
                  onSubmit={() =>
                    void book({
                      courtId: selection.courtId as number,
                      first: selection.first as NonNullable<typeof selection.first>,
                      last: selection.last as NonNullable<typeof selection.last>,
                      total: selection.total,
                      date,
                      onDone: selection.clear,
                    })
                  }
                />
              </div>
            )}
          </div>

          {clubQuery.data.description && (
            <Card className={styles.about}>
              <h2 className={styles.aboutTitle}>{t('about_club')}</h2>
              <p className={styles.description}>{clubQuery.data.description}</p>
            </Card>
          )}

          <OpeningHoursCard hours={hoursQuery.data ?? []} />

          {selection.first && <div className={styles.barSpacer} aria-hidden="true" />}
        </>
      )}
    </AppShell>
  );
}
