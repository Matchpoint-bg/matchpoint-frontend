import { ClubShell } from '../../app/layout/ClubShell';
import { CourtsManager } from '../../features/staff';
import { useI18n } from '../../i18n';
import { Card, CardTitle } from '../../shared/ui';
import { ClubGate } from './ClubGate';

/**
 * Courts, prices and blocked time — the tools that used to sit on the player
 * court page (`CourtStaffBar`) and inside the Settings staff tab.
 */
export function ClubCourtsPage() {
  const { t } = useI18n();

  return (
    <ClubShell title={t('nav_club_courts')}>
      <ClubGate>
        {(club) => (
          <Card padded>
            <CardTitle icon="court">{t('courts_card')}</CardTitle>
            <p className="small-note">{t('courts_card_desc')}</p>
            <CourtsManager clubId={club.id} />
          </Card>
        )}
      </ClubGate>
    </ClubShell>
  );
}
