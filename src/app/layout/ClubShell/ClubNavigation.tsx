import { Link } from 'react-router-dom';
import { Icon } from '../../../shared/ui/Icon';
import type { ClubNavItem, ClubTab } from './navigation.types';

function isCurrent(item: ClubNavItem, active: ClubTab) {
  return item.tab === active || Boolean(item.alsoActiveFor?.includes(active));
}

export function ClubSidebarNav({
  items,
  active,
  label,
}: {
  items: ClubNavItem[];
  active: ClubTab;
  label: string;
}) {
  return (
    <nav className="club-nav" aria-label={label}>
      {items.map((item) => {
        const current = isCurrent(item, active);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={current ? 'active' : ''}
            aria-current={current ? 'page' : undefined}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Bottom bar for the workspace. Reuses the player `.tabbar` classes so operators
 * get the same mobile navigation behaviour they already know.
 */
export function ClubMobileNav({
  items,
  active,
  label,
}: {
  items: ClubNavItem[];
  active: ClubTab;
  label: string;
}) {
  return (
    <nav className="tabbar" aria-label={label}>
      <div className="tabbar__in">
        {items.map((item) => {
          const current = isCurrent(item, active);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={current ? 'active' : ''}
              aria-current={current ? 'page' : undefined}
            >
              <span className="tabbar__ic" aria-hidden="true">
                <span className="tabbar__dot" />
                <Icon name={item.icon} />
              </span>
              <span className="tabbar__label">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
