import { useRef } from 'react';
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

      <div className="grid grid--cards">
        {loading && <Skeleton height={200} count={3} />}

        {!loading && error && <ErrorState msg={error} onRetry={reload} />}

        {!loading && !error && clubs?.length === 0 && (
          <EmptyState title={t('no_clubs_title')} desc={t('no_clubs_desc')} icon="ball" />
        )}

        {!loading &&
          !error &&
          clubs?.map((club) => {
            const courts = demo ? DEMO.courts.filter((c) => c.club_id === club.id) : [];
            const surfaces = [...new Set(courts.map((c) => c.surface_type))];
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
                    {courts.length > 0 && (
                      <span className="chip">
                        <Icon name="court" />
                        {courts.length} {t('courts_suffix')}
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
