import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { useClubFilters, useClubsQuery } from '../../features/clubs';
import { InstallBanner } from '../../features/install';
import { useSettings } from '../../features/preferences';
import { ClubResultCard, PlayerSearchForm, usePlayerSearch } from '../../features/search';
import { useI18n } from '../../i18n';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { Icon } from '../../shared/ui/Icon';
import { Skeleton } from '../../shared/ui/Skeleton';
import styles from './ClubsPage.module.css';

const EMPTY_COURT_SUMMARY = {
  count: 0,
  surfaces: [],
  sports: [],
  indoorCount: 0,
  outdoorCount: 0,
};

export function ClubsPage() {
  const { t, lang } = useI18n();
  const { demo } = useSettings();
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLElement>(null);
  const search = usePlayerSearch();
  const clubsQuery = useClubsQuery();
  const clubs = clubsQuery.data ?? [];
  const criteria = search.urlState.criteria;
  const filters = useClubFilters(
    clubs,
    demo,
    criteria ? { city: criteria.city, sport: criteria.sport } : {},
  );

  const formattedDate = useMemo(() => {
    if (!criteria) return '';
    return new Intl.DateTimeFormat(lang === 'bg' ? 'bg-BG' : 'en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(new Date(`${criteria.date}T12:00:00`));
  }, [criteria, lang]);

  const submitSearch = () => {
    if (!search.submit()) return;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const openClub = (clubId: number) => {
    if (!criteria) return;
    const params = new URLSearchParams({
      city: criteria.city,
      sport: criteria.sport,
      date: criteria.date,
    });
    if (criteria.time) params.set('time', criteria.time);
    navigate(`/clubs/${clubId}?${params.toString()}`);
  };

  return (
    <AppShell active="clubs">
      <section className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            <span />
            {t('search_hero_eyebrow')}
          </span>
          <h1>{t('search_hero_title')}</h1>
          <p>{t('search_hero_desc')}</p>
          <div className={styles.proof} aria-label={t('search_why_matchpoint')}>
            <span><Icon name="check" />{t('search_proof_compare')}</span>
            <span><Icon name="check" />{t('search_proof_no_login')}</span>
          </div>
        </div>

        <PlayerSearchForm
          draft={search.draft}
          errors={search.formErrors}
          invalidUrl={search.urlState.status === 'invalid'}
          onFieldChange={search.setField}
          onSubmit={submitSearch}
        />
      </section>

      {criteria && (
        <section ref={resultsRef} className={styles.results} aria-labelledby="search-results-title">
          <div className={styles.resultsHeader}>
            <div>
              <span className={styles.resultsEyebrow}>{t('search_results_eyebrow')}</span>
              <h2 id="search-results-title">{t('search_results_title')}</h2>
            </div>
            {!clubsQuery.isPending && !clubsQuery.error && (
              <span className={styles.resultCount} aria-live="polite">
                <strong>{filters.filtered.length}</strong>
                {' '}
                {t('search_results_count')}
              </span>
            )}
          </div>

          <div className={styles.criteria} aria-label={t('search_current_search')}>
            <span><Icon name="pin" />{t('sofia')}</span>
            <span><Icon name="ball" />{t('tennis')}</span>
            <span><Icon name="calendar" />{formattedDate}</span>
            {criteria.time && (
              <span><Icon name="clock" />{t('search_from_time')} {criteria.time}</span>
            )}
          </div>

          <div className={styles.resultGrid}>
            {clubsQuery.isPending && <Skeleton height={280} count={2} />}

            {!clubsQuery.isPending && clubsQuery.error && (
              <div className={styles.fullState}>
                <ErrorState
                  msg={clubsQuery.error.message}
                  onRetry={() => void clubsQuery.refetch()}
                />
              </div>
            )}

            {!clubsQuery.isPending && !clubsQuery.error && clubs.length === 0 && (
              <div className={styles.fullState}>
                <EmptyState title={t('no_clubs_title')} desc={t('no_clubs_desc')} icon="ball" />
              </div>
            )}

            {!clubsQuery.isPending &&
              !clubsQuery.error &&
              clubs.length > 0 &&
              filters.filtered.length === 0 && (
                <div className={styles.fullState}>
                  <EmptyState title={t('no_match_title')} desc={t('search_no_match_desc')} icon="info" />
                </div>
              )}

            {!clubsQuery.isPending &&
              !clubsQuery.error &&
              filters.filtered.map((club, index) => (
                <ClubResultCard
                  key={club.id}
                  club={club}
                  courts={filters.courtsByClub.get(club.id) ?? EMPTY_COURT_SUMMARY}
                  index={index}
                  onView={() => openClub(club.id)}
                />
              ))}
          </div>
        </section>
      )}

      <div className={styles.install}>
        <InstallBanner />
      </div>
    </AppShell>
  );
}
