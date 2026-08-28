import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../features/auth';
import { useI18n } from '../../../i18n';
import { Icon } from '../../../shared/ui/Icon';
import { ThemeLanguageControls } from '../ThemeLanguageControls';
import { DesktopNavigation, MobileNavigation } from './AppNavigation';
import type { AppTab, NavigationItem } from './navigation.types';

interface AppShellProps {
  children: ReactNode;
  active: AppTab;
}

export function AppShell({ children, active }: AppShellProps) {
  const { t } = useI18n();
  const { authed, user } = useAuth();
  const primaryItems: NavigationItem[] = [
    {
      to: '/players',
      icon: 'ball',
      desktopLabel: t('nav_clubs'),
      mobileLabel: t('tab_book'),
      tab: 'clubs',
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

  const mobileItems: NavigationItem[] = [
    ...primaryItems,
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

  const initials = ((user?.first_name || user?.email || '?')[0] || '?').toUpperCase();
  const accountName = user?.first_name || t('nav_profile');

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
            <ThemeLanguageControls />

            <div className="topbar__user">
              {authed ? (
                <>
                  <Link
                    className={`shell-icon-button${active === 'settings' ? ' active' : ''}`}
                    to="/settings"
                    aria-label={t('nav_settings')}
                    aria-current={active === 'settings' ? 'page' : undefined}
                  >
                    <Icon name="gear" />
                  </Link>
                  <Link
                    className={`account-link${active === 'profile' ? ' active' : ''}`}
                    to="/profile"
                    aria-label={t('nav_profile')}
                    aria-current={active === 'profile' ? 'page' : undefined}
                    title={user?.email || t('nav_profile')}
                  >
                    <span className="avatar" aria-hidden="true">{initials}</span>
                    <span className="account-link__copy">
                      <strong>{accountName}</strong>
                      <span>{t('nav_profile')}</span>
                    </span>
                  </Link>
                </>
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
