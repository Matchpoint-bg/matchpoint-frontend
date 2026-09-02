import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../../../i18n';
import { useStaffClub } from '../../../features/staff';
import { Icon } from '../../../shared/ui/Icon';
import { AccountMenu } from '../AppShell/AccountMenu';
import { ClubMobileNav, ClubSidebarNav } from './ClubNavigation';
import type { ClubNavItem, ClubTab } from './navigation.types';

interface ClubShellProps {
  children: ReactNode;
  /** Page title shown in the workspace topbar. */
  title: string;
}

/**
 * Shell for the club operator workspace (ToDoRedesign §7).
 *
 * Deliberately separate from `AppShell`: operators and players have different
 * information architectures, and mixing them is what put staff actions on
 * marketplace pages in the first place. Unlike `AppShell`, the active
 * destination is derived from the URL instead of a per-page prop.
 */
export function ClubShell({ children, title }: ClubShellProps) {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const { club } = useStaffClub();

  const items: ClubNavItem[] = [
    {
      to: '/club',
      icon: 'ball',
      label: t('nav_club_overview'),
      shortLabel: t('nav_club_overview'),
      tab: 'overview',
    },
    {
      to: '/club/schedule',
      icon: 'calendar',
      label: t('nav_club_schedule'),
      shortLabel: t('tab_schedule'),
      tab: 'schedule',
    },
    {
      to: '/club/bookings',
      icon: 'ticket',
      label: t('nav_club_bookings'),
      shortLabel: t('tab_bookings'),
      tab: 'bookings',
    },
    {
      to: '/club/courts',
      icon: 'court',
      label: t('nav_club_courts'),
      shortLabel: t('tab_courts'),
      tab: 'courts',
    },
    { to: '/club/team', icon: 'users', label: t('nav_club_team'), shortLabel: t('nav_club_team'), tab: 'team' },
    {
      to: '/club/settings',
      icon: 'gear',
      label: t('nav_club_settings'),
      shortLabel: t('tab_more'),
      tab: 'settings',
      // The bottom bar has four slots, so "More" also stands in for the
      // destinations it links on to (overview, team).
      alsoActiveFor: ['overview', 'team'],
    },
  ];

  const active = tabForPath(pathname);
  const mobileItems = items.filter((item) =>
    ['schedule', 'bookings', 'courts', 'settings'].includes(item.tab),
  );

  return (
    <div className="club-shell">
      <a className="skip-link" href="#main-content">
        {t('skip_to_content')}
      </a>

      <aside className="club-side">
        <Link className="brand club-side__brand" to="/club" aria-label={t('club_workspace')}>
          <span className="brand__mark" aria-hidden="true">
            <Icon name="ball" />
          </span>
          <span className="brand__copy">
            <span className="brand__name">
              Match<em>Point</em>
            </span>
            <span className="brand__tag">{t('club_workspace')}</span>
          </span>
        </Link>

        {/* Static today; becomes a switcher when the backend can say which
            clubs a user manages (see useStaffClub). */}
        <div className="club-side__club">
          <span className="club-side__club-label">{t('staff_club_card')}</span>
          <strong className="club-side__club-name">{club?.name ?? '—'}</strong>
        </div>

        <ClubSidebarNav items={items} active={active} label={t('club_workspace')} />

        <Link className="club-side__exit" to="/players">
          <Icon name="back" />
          <span>{t('back_to_player')}</span>
        </Link>
      </aside>

      <div className="club-main">
        <header className="topbar club-topbar">
          <div className="club-topbar__in">
            <Link className="club-topbar__brand brand" to="/club" aria-label={t('club_workspace')}>
              <span className="brand__mark" aria-hidden="true">
                <Icon name="ball" />
              </span>
            </Link>
            <h1 className="club-topbar__title">{title}</h1>
            <div className="topbar__actions">
              <div className="topbar__user">
                <AccountMenu context="club" />
              </div>
            </div>
          </div>
        </header>

        <main id="main-content" className="club-main__body" tabIndex={-1}>
          {children}
        </main>
      </div>

      <ClubMobileNav items={mobileItems} active={active} label={t('club_workspace')} />
    </div>
  );
}

function tabForPath(pathname: string): ClubTab {
  const rest = pathname.replace(/^\/club\/?/, '');
  switch (rest) {
    case 'schedule':
      return 'schedule';
    case 'bookings':
      return 'bookings';
    case 'courts':
      return 'courts';
    case 'team':
      return 'team';
    case 'settings':
      return 'settings';
    default:
      return 'overview';
  }
}
