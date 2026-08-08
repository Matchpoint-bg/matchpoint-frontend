import { useNavigate, useParams } from 'react-router-dom';
import { Icon, Seam } from '../components/Icons';
import { BackLink, SectionHead, Shell } from '../components/Shell';
import { SurfaceChip } from '../components/Chip';
import { EmptyState, ErrorState, Spinner } from '../components/States';
import { StaffBar } from '../components/staff/StaffBar';
import { useI18n, API_WEEKDAYS } from '../i18n';
import { useSettings } from '../context/SettingsContext';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';

export function ClubDetailPage() {
  const { id } = useParams();
  const clubId = Number(id);
  const { t, weekdays } = useI18n();
  const { demo } = useSettings();
  const navigate = useNavigate();

  const { data, error, loading, reload } = useAsync(async () => {
    // `/clubs/abc` would otherwise fetch `/api/clubs/NaN/`.
    if (!Number.isFinite(clubId)) return { club: undefined, courts: [], hours: [] };
    const [club, courts, hours] = await Promise.all([
      api.club(clubId),
      api.clubCourts(clubId),
      api.clubOpeningHours(clubId).catch(() => []),
    ]);
    return { club, courts, hours };
  }, [clubId, demo]);

  const byDay = Object.fromEntries((data?.hours ?? []).map((h) => [h.weekday, h]));

  return (
    <Shell active="clubs">
      <BackLink label={t('all_clubs')} onClick={() => navigate('/clubs')} />

      {loading && <Spinner />}
      {!loading && error && <ErrorState msg={error} onRetry={reload} />}

      {/* A resolved-but-empty club used to render nothing at all. */}
      {!loading && !error && data && !data.club && (
        <EmptyState title={t('club_missing_title')} desc={t('club_missing_desc')} icon="info">
          <button
            className="btn btn--primary"
            style={{ marginTop: 6 }}
            onClick={() => navigate('/clubs')}
          >
            <Icon name="ball" />
            {t('go_to_clubs')}
          </button>
        </EmptyState>
      )}

      {!loading && !error && data?.club && (
        <>
          <div className="detail-hero">
            <Seam />
            <div className="hero__glow" />
            <div className="hero__eyebrow" style={{ color: 'var(--leaf)' }}>
              {t('tennis_club')}
            </div>
            <h1>{data.club.name}</h1>
            <div className="meta">
              <span>
                <Icon name="pin" />
                {data.club.address || data.club.city || t('sofia')}
              </span>
              {data.club.phone && (
                <span>
                  <Icon name="phone" />
                  {data.club.phone}
                </span>
              )}
              {data.club.email && (
                <span>
                  <Icon name="mail" />
                  {data.club.email}
                </span>
              )}
            </div>
          </div>

          {data.club.description && (
            <p
              style={{
                color: 'var(--ink-2)',
                fontSize: 15,
                maxWidth: '60ch',
                margin: '0 0 8px',
              }}
            >
              {data.club.description}
            </p>
          )}

          <StaffBar club={data.club} onChanged={reload} />

          <SectionHead eyebrow={t('courts_eyebrow')} title={t('courts_h2')} sub={t('courts_sub')} />

          <div className="grid grid--cards">
            {data.courts.length === 0 && (
              <EmptyState title={t('no_courts_title')} desc={t('no_courts_desc')} icon="court" />
            )}
            {data.courts.map((ct) => (
              <button
                key={ct.id}
                className="card card--link"
                style={{ padding: 0 }}
                onClick={() => navigate(`/courts/${ct.id}`)}
              >
                <div className="card--pad">
                  <h3
                    style={{
                      fontFamily: 'var(--display)',
                      fontWeight: 800,
                      fontSize: 17,
                      margin: '0 0 8px',
                    }}
                  >
                    {ct.name}
                  </h3>
                  <div className="chiprow" style={{ marginTop: 0 }}>
                    <SurfaceChip surface={ct.surface_type} />
                    <span className={`chip ${ct.is_indoor ? 'chip--indoor' : 'chip--ghost'}`}>
                      <Icon name="indoor" />
                      {ct.is_indoor ? t('indoor') : t('outdoor')}
                    </span>
                    {ct.is_lit && (
                      <span className="chip chip--lit">
                        <Icon name="bulb" />
                        {t('floodlit')}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: 'var(--ball)',
                      fontWeight: 700,
                      fontSize: 13.5,
                    }}
                  >
                    <Icon name="calendar" />
                    {t('see_availability')}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="card card--pad" style={{ marginTop: 22 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
                color: 'var(--ink)',
              }}
            >
              <span style={{ color: 'var(--ball)' }}>
                <Icon name="clock" />
              </span>
              <b style={{ fontFamily: 'var(--display)', fontSize: 17 }}>{t('opening_hours')}</b>
            </div>
            {API_WEEKDAYS.map((day, i) => {
              const h = byDay[day];
              return (
                <div key={day} className={`oh-row${h ? '' : ' closed'}`}>
                  <span className="d">{weekdays[i]}</span>
                  <span className="h">
                    {h
                      ? `${h.opening_hour.slice(0, 5)} – ${h.closing_hour.slice(0, 5)}`
                      : t('closed')}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Shell>
  );
}
