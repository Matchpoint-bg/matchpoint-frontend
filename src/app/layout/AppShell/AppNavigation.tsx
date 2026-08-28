import { NavLink } from 'react-router-dom';
import { Icon } from '../../../shared/ui/Icon';
import type { AppTab, NavigationItem } from './navigation.types';

export function DesktopNavigation({ items, active }: { items: NavigationItem[]; active: AppTab }) {
  return (
    <nav className="nav-desktop">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={active === item.tab ? 'active' : ''}>
          <Icon name={item.icon} />{item.desktopLabel}
        </NavLink>
      ))}
    </nav>
  );
}

export function MobileNavigation({ items, active }: { items: NavigationItem[]; active: AppTab }) {
  return (
    <nav className="tabbar">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={active === item.tab ? 'active' : ''}>
          <span className="tabbar__ic"><span className="tabbar__dot" /><Icon name={item.icon} /></span>
          {item.mobileLabel}
        </NavLink>
      ))}
    </nav>
  );
}
