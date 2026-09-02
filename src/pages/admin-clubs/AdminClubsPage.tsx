import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminShell } from '../../app/layout/AdminShell';
import { setupChecks, useAdminData } from '../../features/admin';
import { useI18n } from '../../i18n';
import { Icon } from '../../shared/ui/Icon';
import styles from './AdminPages.module.css';

type StatusFilter = 'All' | 'Draft' | 'Active' | 'Inactive';

export function AdminClubsPage() {
  const { t } = useI18n();
  const { clubs } = useAdminData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('All');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return clubs.filter(({ club, manager }) => {
      const haystack = [club.name, club.city, club.address, manager.name, manager.email].filter(Boolean).join(' ').toLowerCase();
      return (!needle || haystack.includes(needle)) && (status === 'All' || club.status === status);
    });
  }, [clubs, query, status]);

  const statusOptions: Array<{ value: StatusFilter; label: string; count: number }> = [
    { value: 'All', label: t('admin_all'), count: clubs.length },
    { value: 'Draft', label: t('admin_status_draft'), count: clubs.filter(({ club }) => club.status === 'Draft').length },
    { value: 'Active', label: t('admin_status_active'), count: clubs.filter(({ club }) => club.status === 'Active').length },
    { value: 'Inactive', label: t('admin_status_inactive'), count: clubs.filter(({ club }) => club.status === 'Inactive').length },
  ];

  return (
    <AdminShell title={t('admin_clubs')}>
      <section className={styles.indexHero}>
        <div>
          <p className="eyebrow">{t('admin_workspace')}</p>
          <h2>{t('admin_clubs_title')}</h2>
          <p>{t('admin_clubs_desc')}</p>
        </div>
        <Link className="btn btn--primary" to="/admin/clubs/new"><Icon name="plus" />{t('admin_create_club')}</Link>
      </section>

      <section className={styles.statusOverview} aria-label={t('admin_filter_status')}>
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.statusStat}${status === option.value ? ` ${styles.statusStatActive}` : ''}`}
            onClick={() => setStatus(option.value)}
            aria-pressed={status === option.value}
          >
            <span className={`${styles.statusDot} ${styles[`dot${option.value}`]}`} />
            <span><small>{option.label}</small><strong>{option.count}</strong></span>
          </button>
        ))}
      </section>

      <section className={`card ${styles.clubDirectory}`}>
        <header className={styles.directoryToolbar}>
          <label className={styles.directorySearch}>
            <span className={styles.visuallyHidden}>{t('admin_search_clubs')}</span>
            <Icon name="search" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('admin_search_clubs')} />
            {query && <button type="button" onClick={() => setQuery('')} aria-label={t('admin_clear_search')}><Icon name="x" /></button>}
          </label>
          <span className={styles.resultCount}>{filtered.length} {filtered.length === 1 ? t('admin_club_result') : t('admin_club_results')}</span>
        </header>

        {filtered.length === 0 ? (
          <div className={styles.directoryEmpty}><Icon name="search" /><h3>{t('admin_no_results')}</h3><p>{t('admin_no_results_desc')}</p><button className="btn btn--soft btn--sm" type="button" onClick={() => { setQuery(''); setStatus('All'); }}>{t('admin_clear_filters')}</button></div>
        ) : (
          <div className={styles.clubList}>
            {filtered.map((setup) => {
              const checks = setupChecks(setup);
              const done = checks.filter((check) => check.complete).length;
              const percent = Math.round(done / checks.length * 100);
              const activeCourts = setup.courts.filter((court) => court.is_active !== false).length;
              return (
                <article className={styles.clubListRow} key={setup.club.id}>
                  <div className={styles.clubThumb}>{setup.club.thumbnail_url ? <img src={setup.club.thumbnail_url} alt="" /> : <Icon name="court" />}</div>
                  <div className={styles.clubIdentity}>
                    <div><h3>{setup.club.name}</h3><span className={`${styles.status} ${styles[`status${setup.club.status ?? 'Draft'}`]}`}>{statusLabel(setup.club.status, t)}</span></div>
                    <p><Icon name="pin" />{[setup.club.address, setup.club.city].filter(Boolean).join(', ') || '—'}</p>
                  </div>
                  <div className={styles.clubManager}><span>{t('admin_manager')}</span><strong><Icon name="user" />{setup.manager.name || t('admin_no_manager')}</strong><small>{setup.manager.email || '—'}</small></div>
                  <div className={styles.clubFacts}><div><span>{t('admin_courts')}</span><strong>{activeCourts}</strong></div><div><span>{t('admin_status')}</span><strong>{statusLabel(setup.club.status, t)}</strong></div></div>
                  <div className={styles.setupProgress}><div><span>{t('admin_setup_progress')}</span><strong>{percent}%</strong></div><div className={styles.progress}><span style={{ width: `${percent}%` }} /></div><small>{done}/{checks.length} {t('admin_setup_complete')}</small></div>
                  <Link className={`btn btn--outline ${styles.rowAction}`} to={`/admin/clubs/${setup.club.id}`} aria-label={`${t('admin_open_setup')}: ${setup.club.name}`}><span>{t('admin_manage')}</span><Icon name="arrowRight" /></Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AdminShell>
  );
}

function statusLabel(status: 'Draft' | 'Active' | 'Inactive' | undefined, t: ReturnType<typeof useI18n>['t']) {
  if (status === 'Active') return t('admin_status_active');
  if (status === 'Inactive') return t('admin_status_inactive');
  return t('admin_status_draft');
}
