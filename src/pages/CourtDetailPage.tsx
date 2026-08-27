import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon, Seam } from '../components/Icons';
import { BackLink, Shell } from '../components/Shell';
import { ErrorState, EmptyState, Skeleton, Spinner } from '../components/States';
import { CourtStaffBar } from '../components/staff/StaffBar';
import { useI18n } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { fmt } from '../lib/format';
import type { Slot } from '../types';

const DAYS_AHEAD = 14;

/** A slot is "booked" when taken, vs "closed" when the club isn't open for it. */
function classify(s: Slot): 'open' | 'booked' | 'closed' {
  const booked = s._booked !== undefined ? s._booked : !s.available;
  if (booked) return 'booked';
  return s.available ? 'open' : 'closed';
}

export function CourtDetailPage() {
  const { id } = useParams();
  const courtId = Number(id);
  const { t, lang } = useI18n();
  const { authed } = useAuth();
  const { demo } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // `?reschedule=<id>` turns this screen into "pick a new time for that booking".
  const [params] = useSearchParams();
  const rescheduleParam = params.get('reschedule');
  const rescheduleId = rescheduleParam !== null ? Number(rescheduleParam) : null;
  const rescheduling = rescheduleId !== null && Number.isFinite(rescheduleId);

  const today = useMemo(() => new Date(), []);
  const [date, setDate] = useState(() => fmt.isoDate(new Date()));
  const [selected, setSelected] = useState<number[]>([]);
  const [booking, setBooking] = useState(false);

  // `/courts/abc` would otherwise fetch `/api/courts/NaN/`.
  const court = useAsync(
    () => (Number.isFinite(courtId) ? api.court(courtId) : Promise.resolve(undefined)),
    [courtId, demo],
  );
  const slots = useAsync(() => api.availability(courtId, date), [courtId, date, demo]);

  // Slot indices only mean anything for the day they were picked on.
  useEffect(() => setSelected([]), [courtId, date, demo]);

  const days = useMemo(
    () =>
      Array.from({ length: DAYS_AHEAD }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d;
      }),
    [today],
  );

  const list = slots.data ?? [];
  const sel = [...selected].sort((a, b) => a - b);
  const contiguous = sel.every((v, i) => i === 0 || v === (sel[i - 1] ?? -99) + 1);
  const total = sel.reduce((sum, i) => sum + (list[i]?.price ?? 0), 0);
  const first = list[sel[0] ?? -1];
  const last = list[sel[sel.length - 1] ?? -1];

  function toggleSlot(idx: number) {
    setSelected((prev) => (prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]));
  }

  async function doBook() {
    if (!first || !last || !court.data) return;
    // Browsing the grid is public; committing to a slot isn't. Send them back here after.
    if (!authed) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setBooking(true);
    const body = {
      court: court.data.id,
      start_datetime: first.start,
      end_datetime: last.end,
    };
    try {
      if (rescheduling && rescheduleId !== null) {
        await api.updateReservation(rescheduleId, body);
        toast(t('rescheduled_toast'), 'ok');
        // Land on the booking that just moved, rather than leaving the user on the grid.
        navigate('/reservations', { state: { highlight: { id: rescheduleId, start: null } } });
        return;
      }
      const created = await api.createReservation(body, { amt: total, date });
      toast(t('booked_toast'), 'ok');
      setSelected([]);
      // POST /api/reservations/ answers with a serializer that omits the new id, so the
      // start time is the only handle we have on the row we just created.
      navigate('/reservations', {
        state: { highlight: { id: created?.id ?? null, start: body.start_datetime } },
      });
    } catch (err) {
      const fallback = rescheduling ? t('reschedule_fail') : t('book_fail');
      toast(err instanceof Error ? err.message : fallback, 'err');
      setBooking(false);
    }
  }

  return (
    <Shell active="clubs">
      <BackLink label={t('back')} onClick={() => navigate(-1)} />

      {court.loading && <Spinner />}
      {!court.loading && court.error && <ErrorState msg={court.error} onRetry={court.reload} />}

      {!court.loading && !court.error && !court.data && (
        <EmptyState title={t('court_missing_title')} desc={t('court_missing_desc')} icon="info">
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

      {!court.loading && !court.error && court.data && (
        <>
          {rescheduling && (
            <div className="notice" role="status">
              <div>
                <b>{t('rescheduling_title')}</b>
                <small>{t('rescheduling_desc')}</small>
              </div>
              <button
                className="btn btn--soft btn--sm"
                onClick={() => navigate('/reservations', { replace: true })}
              >
                {t('cancel_reschedule')}
              </button>
            </div>
          )}

          <div className="detail-hero">
            <Seam />
            <div className="hero__glow" />
            <div className="hero__eyebrow" style={{ color: 'var(--leaf)' }}>
              {court.data.sport_type || t('tennis')} {t('tennis_court')}
            </div>
            <h1>{court.data.name}</h1>
            <div className="meta">
              <span>
                <Icon name="court" />
                {court.data.surface_type}
              </span>
              <span>
                <Icon name="indoor" />
                {court.data.is_indoor ? t('indoor') : t('outdoor')}
              </span>
              {court.data.is_lit && (
                <span>
                  <Icon name="bulb" />
                  {t('floodlit')}
                </span>
              )}
            </div>
          </div>

          <CourtStaffBar court={court.data} onChanged={slots.reload} />

          <div className="section-head" style={{ marginTop: 6 }}>
            <div>
              <div className="eyebrow">{t('availability')}</div>
              <h2>{fmt.dateLong(`${date}T00:00:00`, lang)}</h2>
            </div>
          </div>

          <div className="dayscroll">
            {days.map((d) => {
              const iso = fmt.isoDate(d);
              return (
                <button
                  key={iso}
                  className={`daybtn${iso === date ? ' active' : ''}`}
                  onClick={() => setDate(iso)}
                >
                  <small>{fmt.weekday(d.toISOString(), lang)}</small>
                  <b>{d.getDate()}</b>
                  <small>{fmt.mon(d.toISOString(), lang)}</small>
                </button>
              );
            })}
          </div>

          <div className="legend">
            <span>
              <i className="lg-free" />
              {t('open')}
            </span>
            <span>
              <i className="lg-sel" />
              {t('selected')}
            </span>
            <span>
              <i className="lg-book" />
              {t('booked')}
            </span>
            <span>
              <i className="lg-un" />
              {t('closed_legend')}
            </span>
          </div>

          <div className="slotgrid">
            {slots.loading && <Skeleton height={58} count={10} />}
            {!slots.loading &&
              !slots.error &&
              list.map((s, idx) => {
                const kind = classify(s);
                const isSel = selected.includes(idx);
                const cls =
                  kind === 'booked' ? 'is-booked' : kind === 'closed' ? 'is-un' : isSel ? 'is-sel' : '';
                return (
                  <button
                    key={s.start}
                    className={`slot ${cls}`}
                    disabled={kind !== 'open'}
                    onClick={() => toggleSlot(idx)}
                  >
                    <div className="slot__t">{s._t || fmt.time(s.start)}</div>
                    <div className="slot__p">
                      {kind === 'booked' ? t('booked') : kind === 'closed' ? '—' : fmt.money(s.price)}
                    </div>
                  </button>
                );
              })}
          </div>

          {!slots.loading && slots.error && <ErrorState msg={slots.error} onRetry={slots.reload} />}

          {!slots.loading && !slots.error && list.length === 0 && (
            <EmptyState title={t('club_closed_title')} desc={t('club_closed_desc')} icon="clock" />
          )}

          {sel.length > 0 && first && last && (
            <div className="book-summary">
              <div className="book-summary__in">
                <div className="book-summary__info">
                  <b>
                    {first._t || fmt.time(first.start)} – {fmt.time(last.end)}
                  </b>
                  <small>
                    {sel.length}
                    {t('min30')}
                    {contiguous ? '' : t('consecutive_hint')}
                  </small>
                </div>
                <div className="price-tag" style={{ fontSize: 17 }}>
                  {fmt.money(total)}
                </div>
                <button
                  className="btn btn--primary"
                  disabled={!contiguous || booking}
                  onClick={doBook}
                >
                  <Icon name={authed ? 'check' : 'user'} />
                  {!authed
                    ? t('sign_in')
                    : booking
                      ? t('booking')
                      : rescheduling
                        ? t('confirm_reschedule')
                        : t('book')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Shell>
  );
}
