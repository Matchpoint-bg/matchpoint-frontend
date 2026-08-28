import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth';
import { useI18n } from '../../../i18n';
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
  const navigate = useNavigate();
  const items: NavigationItem[] = [
    {
      to: '/clubs',
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
          {
            to: '/profile',
            icon: 'user',
            desktopLabel: t('nav_profile'),
            mobileLabel: t('nav_profile'),
            tab: 'profile',
          },
          {
            to: '/settings',
            icon: 'gear',
            desktopLabel: t('nav_settings'),
            mobileLabel: t('nav_settings'),
            tab: 'settings',
          },
        ] satisfies NavigationItem[])
      : []),
  ];
  const initials = ((user?.first_name || user?.email || '?')[0] || '?').toUpperCase();

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__in">
          <button className="brand" onClick={() => navigate('/clubs')}>
            <img className="brand__mark" src="/icons/icon-192.png" alt="" />
            <span>
              <span className="brand__name">
                Match<em>Point</em>
              </span>
              <span className="brand__tag">{t('tagline')}</span>
            </span>
          </button>
          <DesktopNavigation items={items} active={active} />
          <ThemeLanguageControls />
          <div className="topbar__user">
            {authed ? (
              <button
                className="avatar"
                onClick={() => navigate('/profile')}
                title={user?.email || ''}
              >
                {initials}
              </button>
            ) : (
              <button
                className="btn btn--primary btn--sm"
                onClick={() => navigate('/login')}
              >
                {t('sign_in')}
              </button>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
      <MobileNavigation items={items} active={active} />
    </div>
  );
}
