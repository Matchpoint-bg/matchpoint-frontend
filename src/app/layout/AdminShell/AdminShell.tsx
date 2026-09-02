import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useI18n } from '../../../i18n';
import { Icon } from '../../../shared/ui/Icon';
import { AccountMenu } from '../AppShell/AccountMenu';
import { ThemeLanguageControls } from '../ThemeLanguageControls';
import styles from './AdminShell.module.css';

export function AdminShell({ children, title }: { children: ReactNode; title: string }) {
  const { t } = useI18n();
  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#admin-main">{t('skip_to_content')}</a>
      <aside className={styles.side}>
        <Link className={`brand ${styles.brand}`} to="/admin/clubs" aria-label={t('admin_workspace')}>
          <span className="brand__mark" aria-hidden="true"><Icon name="ball" /></span>
          <span className="brand__copy">
            <span className="brand__name">Match<em>Point</em></span>
            <span className="brand__tag">{t('admin_workspace')}</span>
          </span>
        </Link>
        <nav className={styles.nav} aria-label={t('admin_workspace')}>
          <NavLink to="/admin/clubs" className={({ isActive }) => isActive ? styles.active : undefined}>
            <Icon name="court" /><span>{t('admin_clubs')}</span>
          </NavLink>
        </nav>
        <Link className={styles.exit} to="/players"><Icon name="back" />{t('back_to_player')}</Link>
      </aside>
      <div className={styles.main}>
        <header className={`topbar ${styles.topbar}`}>
          <Link className={`brand ${styles.mobileBrand}`} to="/admin/clubs"><span className="brand__mark"><Icon name="ball" /></span></Link>
          <h1>{title}</h1>
          <div className="topbar__actions"><ThemeLanguageControls /><div className="topbar__user"><AccountMenu /></div></div>
        </header>
        <main id="admin-main" className={styles.body} tabIndex={-1}>
          <div className={`notice ${styles.prototype}`} role="status"><Icon name="info" />{t('admin_prototype_notice')}</div>
          {children}
        </main>
      </div>
    </div>
  );
}

