import { Navigate, useNavigate } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { useClubFilters, useClubsQuery } from '../../features/clubs';
import { useSettings } from '../../features/preferences';
import { ClubResultCard, PlayerSearchForm, searchCriteriaParams, usePlayerSearch } from '../../features/search';
import { useI18n } from '../../i18n';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { Skeleton } from '../../shared/ui/Skeleton';
import styles from './ClubsPage.module.css';

const EMPTY_COURT_SUMMARY = { count: 0, surfaces: [], sports: [], indoorCount: 0, outdoorCount: 0 };

export function ClubResultsPage() {
  const { t } = useI18n();
  const { demo } = useSettings();
  const navigate = useNavigate();
  const search = usePlayerSearch();
  const clubsQuery = useClubsQuery();
  const clubs = clubsQuery.data ?? [];
  const criteria = search.urlState.criteria;
  const filters = useClubFilters(
    clubs,
    demo,
    criteria ? { city: criteria.city, sport: criteria.sport, surface: criteria.surface ?? null } : {},
  );

  if (search.urlState.status === 'idle') return <Navigate to="/players" replace />;

  const openClub = (clubId: number) => {
    if (!criteria) return;
    const params = searchCriteriaParams(criteria);
    navigate(`/clubs/${clubId}?${params.toString()}`);
  };

  return (
    <AppShell active="clubs">
      <div className={styles.searchPage}>
        <div className={styles.searchPanel}>
          <PlayerSearchForm
            draft={search.draft}
            errors={search.formErrors}
            invalidUrl={search.urlState.status === 'invalid'}
            onFieldChange={search.setField}
            onSubmit={search.submit}
          />
        </div>

        {criteria && (
          <section className={`${styles.results} ${styles.searchResults}`} aria-label={t('search_results_title')}>
            <div className={styles.resultGrid}>
              {clubsQuery.isPending && <Skeleton height={170} count={3} />}
              {!clubsQuery.isPending && clubsQuery.error && (
                <div className={styles.fullState}><ErrorState msg={clubsQuery.error.message} onRetry={() => void clubsQuery.refetch()} /></div>
              )}
              {!clubsQuery.isPending && !clubsQuery.error && clubs.length === 0 && (
                <div className={styles.fullState}><EmptyState title={t('no_clubs_title')} desc={t('no_clubs_desc')} icon="ball" /></div>
              )}
              {!clubsQuery.isPending && !clubsQuery.error && clubs.length > 0 && filters.filtered.length === 0 && (
                <div className={styles.fullState}><EmptyState title={t('no_match_title')} desc={t('search_no_match_desc')} icon="info" /></div>
              )}
              {!clubsQuery.isPending && !clubsQuery.error && filters.filtered.map((club, index) => (
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
      </div>
    </AppShell>
  );
}
