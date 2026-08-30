import { Link } from 'react-router-dom';
import { ClubShell } from '../../app/layout/ClubShell';
import { useI18n } from '../../i18n';
import { Card, CardTitle, Icon } from '../../shared/ui';
import { ClubGate } from './ClubGate';
import styles from './ClubPages.module.css';

/**
 * Workspace entry point. The §14 dashboard (today's bookings, occupancy, quick
 * actions) lands with Phase 7; for now this resolves the managed club and gives
 * one-click access to every workspace destination.
 */
export function ClubOverviewPage() {
  const { t } = useI18n();

  const links = [
    { to: '/club/schedule', icon: 'calendar', label: t('nav_club_schedule') },
    { to: '/club/bookings', icon: 'ticket', label: t('nav_club_bookings') },
    { to: '/club/courts', icon: 'court', label: t('nav_club_courts') },
    { to: '/club/team', icon: 'users', label: t('nav_club_team') },
    { to: '/club/settings', icon: 'gear', label: t('nav_club_settings') },
  ] as const;

  return (
    <ClubShell title={t('nav_club_overview')}>
      <ClubGate>
        {() => (
          <Card padded>
            <CardTitle icon="ball">{t('club_overview_card')}</CardTitle>
            <p className="small-note">{t('club_overview_desc')}</p>
            <div className={styles.links}>
              {links.map((link) => (
                <Link key={link.to} className={styles.link} to={link.to}>
                  <Icon name={link.icon} />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </ClubGate>
    </ClubShell>
  );
}
