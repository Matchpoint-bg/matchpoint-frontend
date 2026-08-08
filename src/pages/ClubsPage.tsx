import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Seam } from '../components/Icons';
import { SectionHead, Shell } from '../components/Shell';
import { SurfaceChip } from '../components/Chip';
import { EmptyState, ErrorState, Skeleton } from '../components/States';
import { InstallBanner } from '../components/InstallBanner';
import { useI18n } from '../i18n';
import { useSettings } from '../context/SettingsContext';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { DEMO } from '../lib/demo';

export function ClubsPage() {
  const { t } = useI18n();
  const { demo } = useSettings();
  const navigate = useNavigate();
  const headRef = useRef<HTMLDivElement>(null);

  const { data: clubs, error, loading, reload } = useAsync(() => api.clubs(), [demo]);

  const [query, setQuery] = useState('');
  const [surface, setSurface] = useState<string | null>(null);

  /**
   * Surfaces per club come from the court fixtures, which only exist in demo mode — the
   * club list endpoint doesn't carry them. Where there's no surface data the filter row is
   * hidden rather than shown as a control that does nothing.
   */
  const courtsByClub = useMemo(() => {
    const map = new Map<number, { count: number; surfaces: string[] }>();
    if (!demo) return map;
    for (const club of clubs ?? []) {
      const courts = DEMO.courts.filter((c) => c.club_id === club.id);
      map.set(club.id, {
        count: courts.length,
        surfaces: [...new Set(courts.map((c) => c.surface_type))],
      });
    }
    return map;
  }, [clubs, demo]);

  const surfaceOptions = useMemo(
    () => [...new Set([...courtsByClub.values()].flatMap((v) => v.surfaces))].sort(),
    [courtsByClub],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (clubs ?? []).filter((club) => {
      if (q) {
        const haystack = [club.name, club.city, club.address, club.description]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (surface && !courtsByClub.get(club.id)?.surfaces.includes(surface)) return false;
      return true;
    });
  }, [clubs, query, surface, courtsByClub]);

  return (
    <Shell active="clubs">
      <section className="hero">
        <Seam />
        <div className="hero__glow" />
        <div className="hero__eyebrow">{demo ? t('demo_badge') : t('sofia')}</div>
        <h1>
          {t('hero_title1')}
          <br />
          <span>{t('hero_title2')}</span>
        </h1>
        <p>{t('hero_p')}</p>
        <div className="hero__actions">
          <button
            className="btn btn--primary"
            onClick={() => headRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Icon name="ball" />
            {t('browse_clubs')}
          </button>
          <button className="btn btn--ghost" onClick={() => navigate('/reservations')}>
            <Icon name="ticket" />
            {t('my_bookings')}
          </button>
        </div>
      </section>

      <InstallBanner />

      <div ref={headRef}>
        <SectionHead eyebrow={t('clubs_eyebrow')} title={t('clubs_h2')} />
      </div>

      <div className="clubfilters">
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="club-search">{t('search_clubs')}</label>
          <input
            id="club-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_clubs_placeholder')}
            autoComplete="off"
          />
        </div>

        {surfaceOptions.length > 0 && (
          <div className="chiprow" role="group" aria-label={t('surface')}>
            <button
              className={`chip chip--btn${surface === null ? ' chip--on' : ''}`}
              aria-pressed={surface === null}
              onClick={() => setSurface(null)}
            >
              {t('all_surfaces')}
            </button>
            {surfaceOptions.map((s) => (
              <button
                key={s}
                className={`chip chip--btn${surface === s ? ' chip--on' : ''}`}
                aria-pressed={surface === s}
                onClick={() => setSurface(surface === s ? null : s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid--cards">
        {loading && <Skeleton height={200} count={3} />}

        {!loading && error && <ErrorState msg={error} onRetry={reload} />}

        {!loading && !error && clubs?.length === 0 && (
          <EmptyState title={t('no_clubs_title')} desc={t('no_clubs_desc')} icon="ball" />
        )}

        {!loading && !error && (clubs?.length ?? 0) > 0 && filtered.length === 0 && (
          <EmptyState title={t('no_match_title')} desc={t('no_match_desc')} icon="info">
            <button
              className="btn btn--soft btn--sm"
              style={{ marginTop: 6 }}
              onClick={() => {
                setQuery('');
                setSurface(null);
              }}
            >
              {t('clear_filters')}
            </button>
          </EmptyState>
        )}

        {!loading &&
          !error &&
          filtered.map((club) => {
            const { count = 0, surfaces = [] } = courtsByClub.get(club.id) ?? {};
            return (
              <button
                key={club.id}
                className="card card--link"
                onClick={() => navigate(`/clubs/${club.id}`)}
              >
                <div className="club-card__top">
                  <Seam className="club-card__seam" />
                </div>
                <div className="club-card__body">
                  <h3>{club.name}</h3>
                  <div className="club-card__meta">
                    <Icon name="pin" />
                    <span>{club.address || club.city || t('sofia')}</span>
                  </div>
                  {club.description && (
                    <p
                      style={{
                        color: 'var(--muted)',
                        fontSize: 13.5,
                        margin: '10px 0 0',
                        lineHeight: 1.45,
                      }}
                    >
                      {club.description}
                    </p>
                  )}
                  <div className="chiprow">
                    {count > 0 && (
                      <span className="chip">
                        <Icon name="court" />
                        {count} {t('courts_suffix')}
                      </span>
                    )}
                    {surfaces.map((s) => (
                      <SurfaceChip key={s} surface={s} />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </Shell>
  );
}
