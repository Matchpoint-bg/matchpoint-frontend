import { ClubShell } from '../../app/layout/ClubShell';
import { useI18n } from '../../i18n';
import { EmptyState } from '../../shared/ui/EmptyState';
import { ClubGate } from './ClubGate';

/** Placeholder — booking management ships with Phase 7 (§14). */
export function ClubBookingsPage() {
  const { t } = useI18n();

  return (
    <ClubShell title={t('nav_club_bookings')}>
      <ClubGate>
        {() => <EmptyState title={t('club_soon_title')} desc={t('club_bookings_soon')} icon="ticket" />}
      </ClubGate>
    </ClubShell>
  );
}
