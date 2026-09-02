import { NavLink } from 'react-router-dom';
import { Icon } from '../../../shared/ui/Icon';
import type { AppTab, NavigationItem } from './navigation.types';

export function DesktopNavigation({ items, active }: { items: NavigationItem[]; active: AppTab }) {
  return (
    <nav className="nav-desktop" aria-label="MatchPoint">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={active === item.tab ? 'active' : ''}
          aria-current={active === item.tab ? 'page' : undefined}
        >
          <Icon name={item.icon} />
          <span>{item.desktopLabel}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function MobileNavigation({ items, active }: { items: NavigationItem[]; active: AppTab }) {
  return (
    <nav className="tabbar" aria-label="MatchPoint">
      <div className="tabbar__in">
        {items.map((item) => {
          const isCurrent = item.tab !== undefined && active === item.tab;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={isCurrent ? 'active' : ''}
              aria-current={isCurrent ? 'page' : undefined}
              onClick={(event) => {
                if (!item.onClick) return;
                event.preventDefault();
                item.onClick();
              }}
            >
              <span className="tabbar__ic" aria-hidden="true">
                <span className="tabbar__dot" />
                <Icon name={item.icon} />
              </span>
              <span className="tabbar__label">{item.mobileLabel}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
