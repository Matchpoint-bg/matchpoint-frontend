import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import {
  ClubHero,
  OpeningHoursCard,
  useClubCourtsQuery,
  useClubOpeningHoursQuery,
  useClubQuery,
} from '../../features/clubs';
import {
  bookingIntentStore,
  bookingIntentUrl,
  ClubAvailability,
  RescheduleNotice,
} from '../../features/booking';
import type { BookingIntent } from '../../features/booking';
import { useI18n } from '../../i18n';
import { fmt } from '../../shared/lib/format';
import { Button, Chip, ChipRow, SurfaceBadge } from '../../shared/ui';
import { Tabs } from '../../shared/ui/Tabs';
import { BackLink } from '../../shared/ui/BackLink';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { Icon } from '../../shared/ui/Icon';
import { Spinner } from '../../shared/ui/Spinner';
import styles from './ClubDetailsPage.module.css';

export function ClubDetailsPage() {
  const { id } = useParams();
  const clubId = Number(id);
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();
  const clubListUrl = search ? `/search?${search}` : '/players';
  const clubQuery = useClubQuery(clubId);
  const courtsQuery = useClubCourtsQuery(clubId);
  const hoursQuery = useClubOpeningHoursQuery(clubId);
  const loading = clubQuery.isPending;
  const error = clubQuery.error;
  const [date, setDate] = useState(() => {
    const requested = searchParams.get('date');
    const today = fmt.isoDate(new Date());
    return requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) && requested >= today
      ? requested
      : today;
  });
  // `?reschedule=<id>` means the player is moving an existing booking: the whole
  // page exists to pick a new time, so it opens straight on availability.
  const rescheduleParam = searchParams.get('reschedule');
  const rescheduleOf = rescheduleParam === null ? null : Number(rescheduleParam);
  const rescheduling = rescheduleOf !== null && Number.isFinite(rescheduleOf);
  const [activeTab, setActiveTab] = useState<'booking' | 'info'>(
    rescheduling ? 'booking' : 'info',
  );

  const reload = () => {
    void Promise.all([clubQuery.refetch(), courtsQuery.refetch(), hoursQuery.refetch()]);
  };

  const changeDate = (nextDate: string) => {
    setDate(nextDate);
    const next = new URLSearchParams(searchParams);
    next.set('date', nextDate);
    navigate({ search: next.toString() }, { replace: true });
  };

  const review = (intent: BookingIntent) => {
    const next = rescheduling ? { ...intent, rescheduleOf: rescheduleOf as number } : intent;
    bookingIntentStore.save(next);
    navigate(bookingIntentUrl(next));
  };

  const openBooking = () => {
    setActiveTab('booking');
    requestAnimationFrame(() => document.getElementById('club-booking-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <AppShell active="clubs">
      <BackLink
        label={rescheduling ? t('my_reservations') : t('all_clubs')}
        onClick={() => navigate(rescheduling ? '/reservations' : clubListUrl)}
      />

      {rescheduling && (
        <RescheduleNotice onCancel={() => navigate('/reservations', { replace: true })} />
      )}

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
          <ClubHero club={clubQuery.data} />

          <Tabs
            items={[
              { value: 'info', label: t('club_tab_info') },
              { value: 'booking', label: t('club_tab_booking') },
            ]}
            value={activeTab}
            onChange={setActiveTab}
            label={t('club_tabs_label')}
            getPanelId={(value) => `club-${value}-panel`}
            className={styles.tabs}
          />

          <div
            id="club-info-panel"
            role="tabpanel"
            aria-label={t('club_tab_info')}
            hidden={activeTab !== 'info'}
          >
            <section className={styles.details} aria-labelledby="club-details-title">
              <div className={styles.about}>
                <span className="eyebrow">{t('club_details')}</span>
                <h2 id="club-details-title">{t('club_about_title')}</h2>
                {clubQuery.data.description && <p>{clubQuery.data.description}</p>}

                <Button icon="calendar" iconPosition="start" onClick={openBooking} className={styles.bookButton}>
                  {t('club_book_court')}
                </Button>

                {((courtsQuery.data ?? []).length > 0 || (clubQuery.data.facilities?.length ?? 0) > 0) && (
                  <div className={styles.amenities}>
                    <h3>{t('club_features')}</h3>
                    {(courtsQuery.data ?? []).length > 0 && (
                      <ChipRow className={styles.facts}>
                        {[...new Set((courtsQuery.data ?? []).map((court) => court.surface_type))].map((surface) => (
                          <SurfaceBadge key={surface} surface={surface} />
                        ))}
                        {(courtsQuery.data ?? []).some((court) => court.is_indoor) && <Chip icon="indoor" variant="indoor">{t('indoor')}</Chip>}
                        {(courtsQuery.data ?? []).some((court) => !court.is_indoor) && <Chip icon="court" variant="ghost">{t('outdoor')}</Chip>}
                        {(courtsQuery.data ?? []).some((court) => court.is_lit) && <Chip icon="bulb" variant="lit">{t('floodlit')}</Chip>}
                      </ChipRow>
                    )}
                    {(clubQuery.data.facilities?.length ?? 0) > 0 && (
                    <ul>
                      {clubQuery.data.facilities?.map((facility) => (
                        <li key={facility}><Icon name="check" />{facility}</li>
                      ))}
                    </ul>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.infoGrid}>
                <OpeningHoursCard hours={hoursQuery.data ?? []} />

                <div className={styles.galleryCard}>
                  {(clubQuery.data.gallery_urls?.[0] || clubQuery.data.thumbnail_url) ? (
                    <img src={clubQuery.data.gallery_urls?.[0] || clubQuery.data.thumbnail_url} alt={clubQuery.data.name} />
                  ) : (
                    <span><Icon name="court" />{t('club_gallery_fallback')}</span>
                  )}
                </div>

              </div>
            </section>
          </div>

          <div
            id="club-booking-panel"
            role="tabpanel"
            aria-label={t('club_tab_booking')}
            hidden={activeTab !== 'booking'}
          >
            <ClubAvailability club={clubQuery.data} date={date} onDateChange={changeDate} onReview={review} />
          </div>
        </>
      )}
    </AppShell>
  );
}
