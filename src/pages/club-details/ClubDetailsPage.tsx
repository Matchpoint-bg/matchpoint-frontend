import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import {
  ClubHero,
  OpeningHoursCard,
  useClubCourtsQuery,
  useClubOpeningHoursQuery,
  useClubQuery,
} from '../../features/clubs';
import { CourtCard } from '../../features/courts';
import { StaffBar } from '../../features/staff';
import { useI18n } from '../../i18n';
import { BackLink } from '../../shared/ui/BackLink';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { Icon } from '../../shared/ui/Icon';
import { SectionHeader } from '../../shared/ui/SectionHeader';
import { Spinner } from '../../shared/ui/Spinner';
import styles from './ClubDetailsPage.module.css';

export function ClubDetailsPage() {
  const { id } = useParams();
  const clubId = Number(id);
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();
  const playersUrl = search ? `/players?${search}` : '/players';
  const clubQuery = useClubQuery(clubId);
  const courtsQuery = useClubCourtsQuery(clubId);
  const hoursQuery = useClubOpeningHoursQuery(clubId);
  const loading = clubQuery.isPending || courtsQuery.isPending;
  const error = clubQuery.error ?? courtsQuery.error;

  const reload = () => {
    void Promise.all([clubQuery.refetch(), courtsQuery.refetch(), hoursQuery.refetch()]);
  };

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
          <ClubHero club={clubQuery.data} />

          {clubQuery.data.description && (
            <p className={styles.description}>{clubQuery.data.description}</p>
          )}

          <StaffBar club={clubQuery.data} onChanged={reload} />

          <SectionHeader
            eyebrow={t('courts_eyebrow')}
            title={t('courts_h2')}
            sub={t('courts_sub')}
          />

          <div className="grid grid--cards">
            {(courtsQuery.data ?? []).length === 0 && (
              <EmptyState title={t('no_courts_title')} desc={t('no_courts_desc')} icon="court" />
            )}
            {(courtsQuery.data ?? []).map((court) => (
              <CourtCard
                key={court.id}
                court={court}
                onClick={() => navigate(`/courts/${court.id}${search ? `?${search}` : ''}`)}
              />
            ))}
          </div>

          <OpeningHoursCard hours={hoursQuery.data ?? []} />
        </>
      )}
    </AppShell>
  );
}
