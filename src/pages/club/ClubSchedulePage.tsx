import { ClubShell } from '../../app/layout/ClubShell';
import { useI18n } from '../../i18n';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ClubGate } from './ClubGate';

/** Placeholder — the operational day/week schedule ships with Phase 7 (§14). */
export function ClubSchedulePage() {
  const { t } = useI18n();

  return (
    <ClubShell title={t('nav_club_schedule')}>
      <ClubGate>
        {() => <EmptyState title={t('club_soon_title')} desc={t('club_schedule_soon')} icon="calendar" />}
      </ClubGate>
    </ClubShell>
  );
}
