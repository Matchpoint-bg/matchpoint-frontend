import { ClubShell } from '../../app/layout/ClubShell';
import { EmployeesModal } from '../../features/staff';
import { useI18n } from '../../i18n';
import { Card, CardTitle } from '../../shared/ui';
import { ClubGate } from './ClubGate';

/**
 * Employees. The list itself is `EmployeesModal`, which is plain content — it
 * simply used to be opened from the club page's staff bar.
 */
export function ClubTeamPage() {
  const { t } = useI18n();

  return (
    <ClubShell title={t('nav_club_team')}>
      <ClubGate>
        {(club) => (
          <Card padded>
            <CardTitle icon="users">{t('club_team_card')}</CardTitle>
            <p className="small-note">{t('club_team_desc')}</p>
            <EmployeesModal clubId={club.id} />
          </Card>
        )}
      </ClubGate>
    </ClubShell>
  );
}
