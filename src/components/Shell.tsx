import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from './Icons';
import type { IconName } from './Icons';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';
import { useAuth } from '../context/AuthContext';

export type Tab = 'clubs' | 'reservations' | 'profile' | 'settings';

interface NavItem {
  to: string;
  icon: IconName;
  desktopLabel: string;
  mobileLabel: string;
  tab: Tab;
}

export function ThemeLangToggles() {
  const { lang, toggleLang, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <button className="lang-toggle" onClick={toggleLang} title={t('language')}>
        {lang === 'bg' ? 'EN' : 'BG'}
      </button>
      <button className="theme-toggle" onClick={toggleTheme} title={t('theme_label')}>
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
      </button>
    </>
  );
}

export function Shell({ children, active }: { children: ReactNode; active: Tab }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  const items: NavItem[] = [
    { to: '/clubs', icon: 'ball', desktopLabel: t('nav_clubs'), mobileLabel: t('tab_book'), tab: 'clubs' },
    { to: '/reservations', icon: 'ticket', desktopLabel: t('nav_reservations'), mobileLabel: t('tab_bookings'), tab: 'reservations' },
    { to: '/profile', icon: 'user', desktopLabel: t('nav_profile'), mobileLabel: t('nav_profile'), tab: 'profile' },
    { to: '/settings', icon: 'gear', desktopLabel: t('nav_settings'), mobileLabel: t('nav_settings'), tab: 'settings' },
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

          <nav className="nav-desktop">
            {items.map((it) => (
              <NavLink key={it.to} to={it.to} className={active === it.tab ? 'active' : ''}>
                <Icon name={it.icon} />
                {it.desktopLabel}
              </NavLink>
            ))}
          </nav>

          <ThemeLangToggles />

          <div className="topbar__user">
            <button className="avatar" onClick={() => navigate('/profile')} title={user?.email || ''}>
              {initials}
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <nav className="tabbar">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} className={active === it.tab ? 'active' : ''}>
            <span className="tabbar__ic">
              <span className="tabbar__dot" />
              <Icon name={it.icon} />
            </span>
            {it.mobileLabel}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="backlink" onClick={onClick}>
      <Icon name="back" />
      {label}
    </button>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {children}
    </div>
  );
}
