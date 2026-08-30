import type { ReactNode } from 'react';
import { useI18n } from '../../i18n';
import { useStaffClub } from '../../features/staff';
import type { Club } from '../../features/clubs';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ErrorState } from '../../shared/ui/ErrorState';
import { Spinner } from '../../shared/ui/Spinner';
import { Select } from '../../shared/ui';

/**
 * Resolves the club a workspace page operates on before rendering it.
 *
 * With a single club there is nothing to choose; with several — and no
 * membership endpoint to narrow them (see `useStaffClub`) — the operator picks
 * one and the choice sticks for the device.
 */
export function ClubGate({ children }: { children: (club: Club) => ReactNode }) {
  const { t } = useI18n();
  const { clubs, club, isPending, error, refetch, setClubId } = useStaffClub();

  if (isPending) return <Spinner />;
  if (error) return <ErrorState msg={error.message} onRetry={refetch} />;
  if (!clubs.length) {
    return <EmptyState title={t('no_clubs_staff')} desc={t('staff_club_desc')} icon="info" />;
  }
  if (!club) {
    return (
      <div className="card card--pad">
        <h2 className="club-gate__title">{t('staff_club_card')}</h2>
        <p className="small-note">{t('select_club_first')}</p>
        <Select
          value=""
          aria-label={t('staff_club_card')}
          onChange={(event) => setClubId(event.target.value ? Number(event.target.value) : null)}
          options={[
            { value: '', label: '—' },
            ...clubs.map((club) => ({ value: String(club.id), label: club.name })),
          ]}
        />
      </div>
    );
  }

  return <>{children(club)}</>;
}
