import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../features/auth';
import { useI18n } from '../../../i18n';
import { Icon } from '../../../shared/ui/Icon';
import { DemoBadge } from '../DemoBadge';
import { ThemeLanguageControls } from '../ThemeLanguageControls';
import { AccountMenu } from './AccountMenu';
import { DesktopNavigation, MobileNavigation } from './AppNavigation';
import type { AppTab, NavigationItem } from './navigation.types';

interface AppShellProps {
  children: ReactNode;
  active: AppTab;
}

export function AppShell({ children, active }: AppShellProps) {
  const { t } = useI18n();
  const { authed } = useAuth();
  const primaryItems: NavigationItem[] = [
    {
      to: '/players',
      icon: 'ball',
      desktopLabel: t('nav_clubs'),
      mobileLabel: t('tab_book'),
      tab: 'clubs',
    },
    {
      to: '/for-clubs',
      icon: 'users',
      desktopLabel: t('nav_for_clubs'),
      mobileLabel: t('nav_for_clubs'),
      tab: 'for-clubs',
    },
    ...(authed
      ? ([
          {
            to: '/reservations',
            icon: 'ticket',
            desktopLabel: t('nav_reservations'),
            mobileLabel: t('tab_bookings'),
            tab: 'reservations',
          },
        ] satisfies NavigationItem[])
      : []),
  ];

  // Mobile keeps player primary destinations only; "For clubs" is B2B and
  // stays a desktop-header/landing-page entry point.
  const mobileItems: NavigationItem[] = [
    ...primaryItems.filter((item) => item.tab !== 'for-clubs'),
    ...(authed
      ? ([
          {
            to: active === 'settings' ? '/settings' : '/profile',
            icon: active === 'settings' ? 'gear' : 'user',
            desktopLabel: active === 'settings' ? t('nav_settings') : t('nav_profile'),
            mobileLabel: active === 'settings' ? t('nav_settings') : t('nav_profile'),
            tab: active === 'settings' ? 'settings' : 'profile',
          },
        ] satisfies NavigationItem[])
      : ([
          {
            to: '/login',
            icon: 'user',
            desktopLabel: t('sign_in'),
            mobileLabel: t('sign_in'),
          },
        ] satisfies NavigationItem[])),
  ];

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        {t('skip_to_content')}
      </a>
      <header className="topbar">
        <div className="topbar__in">
          <Link className="brand" to="/players" aria-label={`MatchPoint · ${t('tab_book')}`}>
            <span className="brand__mark" aria-hidden="true">
              <Icon name="ball" />
            </span>
            <span className="brand__copy">
              <span className="brand__name">
                Match<em>Point</em>
              </span>
              <span className="brand__tag">{t('tagline')}</span>
            </span>
          </Link>

          <DesktopNavigation items={primaryItems} active={active} />

          <div className="topbar__actions">
            <DemoBadge />
            {/* Outside `.topbar__user`, which is hidden below 900px: browsing is
                public, so language and theme cannot depend on an account or a
                wide screen. The account menu keeps its own copies for the
                signed-in desktop path. */}
            <ThemeLanguageControls />
            <div className="topbar__user">
              {authed ? (
                <AccountMenu active={active} />
              ) : (
                <Link className="topbar__signin btn btn--primary btn--sm" to="/login">
                  {t('sign_in')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <main id="main-content" className="app__main" tabIndex={-1}>
        {children}
      </main>
      <MobileNavigation items={mobileItems} active={active} />
    </div>
  );
}
