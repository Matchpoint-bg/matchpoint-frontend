import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { useAuth } from '../../features/auth';
import {
  ClubCard,
  ClubFilters,
  ClubsHero,
  useClubFilters,
  useClubsQuery,
} from '../../features/clubs';
import { InstallBanner } from '../../features/install';
import { useSettings } from '../../features/preferences';
import { useI18n } from '../../i18n';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { SectionHeader } from '../../shared/ui/SectionHeader';
import { Skeleton } from '../../shared/ui/Skeleton';
import styles from './ClubsPage.module.css';

export function ClubsPage() {
  const { t } = useI18n();
  const { authed } = useAuth();
  const { demo } = useSettings();
  const navigate = useNavigate();
  const headingRef = useRef<HTMLDivElement>(null);
  const clubsQuery = useClubsQuery();
  const clubs = clubsQuery.data ?? [];
  const filters = useClubFilters(clubs, demo);

  return (
    <AppShell active="clubs">
      <ClubsHero
        demo={demo}
        authenticated={authed}
        onBrowse={() => headingRef.current?.scrollIntoView({ behavior: 'smooth' })}
        onBookings={() => navigate('/reservations')}
      />

      <InstallBanner />

      <div ref={headingRef}>
        <SectionHeader eyebrow={t('clubs_eyebrow')} title={t('clubs_h2')} />
      </div>

      <ClubFilters
        query={filters.query}
        surface={filters.surface}
        surfaces={filters.surfaceOptions}
        onQueryChange={filters.setQuery}
        onSurfaceChange={filters.setSurface}
      />

      <div className="grid grid--cards">
        {clubsQuery.isPending && <Skeleton height={200} count={3} />}

        {!clubsQuery.isPending && clubsQuery.error && (
          <ErrorState
            msg={clubsQuery.error.message}
            onRetry={() => void clubsQuery.refetch()}
          />
        )}

        {!clubsQuery.isPending && !clubsQuery.error && clubs.length === 0 && (
          <EmptyState title={t('no_clubs_title')} desc={t('no_clubs_desc')} icon="ball" />
        )}

        {!clubsQuery.isPending &&
          !clubsQuery.error &&
          clubs.length > 0 &&
          filters.filtered.length === 0 && (
            <EmptyState title={t('no_match_title')} desc={t('no_match_desc')} icon="info">
              <button
                className={`btn btn--soft btn--sm ${styles.emptyAction}`}
                onClick={filters.clear}
              >
                {t('clear_filters')}
              </button>
            </EmptyState>
          )}

        {!clubsQuery.isPending &&
          !clubsQuery.error &&
          filters.filtered.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              courts={filters.courtsByClub.get(club.id) ?? { count: 0, surfaces: [] }}
              onClick={() => navigate(`/clubs/${club.id}`)}
            />
          ))}
      </div>
    </AppShell>
  );
}
