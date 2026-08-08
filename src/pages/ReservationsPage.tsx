import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { SectionHead, Shell } from '../components/Shell';
import { EmptyState, ErrorState, Spinner } from '../components/States';
import { useI18n } from '../i18n';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { fmt } from '../lib/format';
import type { Reservation } from '../types';

function ResCard({
  r,
  courtLabel,
  upcoming,
  highlighted,
  onCancel,
  onReschedule,
}: {
  r: Reservation;
  courtLabel: string;
  upcoming: boolean;
  highlighted: boolean;
  onCancel: (r: Reservation) => void;
  onReschedule: (r: Reservation) => void;
}) {
  const { t, lang } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const dur = Math.round(
    (new Date(r.end_datetime).getTime() - new Date(r.start_datetime).getTime()) / 60000,
  );

  // Arriving straight from a booking or reschedule: bring the affected card into view.
  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlighted]);

  return (
    <div ref={ref} className={`card${highlighted ? ' card--flash' : ''}`}>
      <div className="res-row">
        <div className="res-cal">
          <small>{fmt.mon(r.start_datetime, lang)}</small>
          <b>{fmt.dayNum(r.start_datetime)}</b>
          <small>{fmt.weekday(r.start_datetime, lang)}</small>
        </div>
        <div className="res-main">
          <h3>{courtLabel}</h3>
          <div className="l">
            <span>
              <Icon name="clock" />
              {fmt.time(r.start_datetime)}–{fmt.time(r.end_datetime)} · {dur}
              {t('min')}
            </span>
            {r.reservation_amt ? (
              <span>
                <Icon name="tag" />
                <span className="price-tag">{fmt.money(r.reservation_amt)}</span>
              </span>
            ) : null}
          </div>
        </div>
        <div className="res-actions">
          <span className={`status ${upcoming ? 'status--up' : 'status--past'}`}>
            {upcoming ? t('upcoming') : t('played')}
          </span>
          {upcoming && (
            <>
              <button
                className="btn btn--outline btn--sm"
                aria-label={t('reschedule')}
                title={t('reschedule')}
                onClick={() => onReschedule(r)}
              >
                <Icon name="clock" />
              </button>
              <button
                className="btn btn--danger btn--sm"
                aria-label={t('cancel')}
                title={t('cancel')}
                onClick={() => onCancel(r)}
              >
                <Icon name="trash" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CancelBody({
  r,
  courtLabel,
  onConfirm,
  onKeep,
}: {
  r: Reservation;
  courtLabel: string;
  onConfirm: () => Promise<void>;
  onKeep: () => void;
}) {
  const { t, lang } = useI18n();
  return (
    <div>
      <p style={{ margin: '0 0 18px', color: 'var(--ink-2)' }}>
        {t('cancel_confirm')} <b>{courtLabel}</b> {t('on')}{' '}
        {fmt.dateLong(r.start_datetime, lang)} {t('at')} {fmt.time(r.start_datetime)}?
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn--outline btn--block" onClick={onKeep}>
          {t('keep_it')}
        </button>
        <button className="btn btn--danger btn--block" onClick={onConfirm}>
          <Icon name="trash" />
          {t('cancel_booking')}
        </button>
      </div>
    </div>
  );
}

export function ReservationsPage() {
  const { t } = useI18n();
  const { demo } = useSettings();
  const { isStaff } = useAuth();
  const { openModal, closeModal } = useModal();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Set by the court screen after a booking or reschedule. Matched by id when we have one,
  // otherwise by start time — see the comment on the create call in CourtDetailPage.
  const highlight =
    (location.state as { highlight?: { id: number | null; start: string | null } } | null)
      ?.highlight ?? null;
  const isHighlighted = (r: Reservation) =>
    highlight !== null &&
    ((highlight.id !== null && r.id === highlight.id) ||
      (highlight.start !== null && r.start_datetime === highlight.start));

  const { data, error, loading, reload } = useAsync(async () => {
    const res = await api.reservations();
    const list = res
      .slice()
      .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());

    // A reservation only carries a court id, so resolve the names it refers to. Looking
    // them up in the demo fixtures would put fixture names on real bookings.
    const ids = [...new Set(list.map((r) => r.court))];
    const courts = await Promise.all(ids.map((id) => api.court(id).catch(() => undefined)));
    const names = new Map<number, string>();
    ids.forEach((id, i) => {
      const name = courts[i]?.name;
      if (name) names.set(id, name);
    });
    return { list, names };
  }, [demo]);

  const courtLabel = (r: Reservation) =>
    data?.names.get(r.court) ?? `${t('tennis_court')} #${r.court}`;

  function askCancel(r: Reservation) {
    openModal(
      t('cancel_title'),
      <CancelBody
        r={r}
        courtLabel={courtLabel(r)}
        onKeep={closeModal}
        onConfirm={async () => {
          try {
            await api.deleteReservation(r.id);
            toast(t('cancelled_toast'), 'ok');
            closeModal();
            reload();
          } catch (e) {
            toast(e instanceof Error ? e.message : String(e), 'err');
          }
        }}
      />,
    );
  }

  function goReschedule(r: Reservation) {
    navigate(`/courts/${r.court}?reschedule=${r.id}`);
  }

  const now = Date.now();
  const all = data?.list ?? [];
  const upcoming = all.filter((r) => new Date(r.end_datetime).getTime() >= now);
  const past = all.filter((r) => new Date(r.end_datetime).getTime() < now);

  return (
    <Shell active="reservations">
      <SectionHead
        eyebrow={t('reservations_eyebrow')}
        title={t('reservations_h2')}
        {...(isStaff ? { sub: t('staff_res_note') } : {})}
      >
        <button className="btn btn--soft btn--sm" onClick={() => navigate('/clubs')}>
          <Icon name="plus" />
          {t('book_more')}
        </button>
      </SectionHead>

      {loading && <Spinner />}
      {!loading && error && <ErrorState msg={error} onRetry={reload} />}

      {!loading && !error && all.length === 0 && (
        <EmptyState title={t('no_res_title')} desc={t('no_res_desc')} icon="ticket">
          <button
            className="btn btn--primary"
            style={{ marginTop: 6 }}
            onClick={() => navigate('/clubs')}
          >
            <Icon name="ball" />
            {t('find_court')}
          </button>
        </EmptyState>
      )}

      {!loading && !error && upcoming.length > 0 && (
        <>
          <div style={{ margin: '22px 0 10px' }}>
            <div className="eyebrow eyebrow--muted">{t('upcoming')}</div>
          </div>
          <div className="grid">
            {upcoming.map((r) => (
              <ResCard
                key={r.id}
                r={r}
                courtLabel={courtLabel(r)}
                upcoming
                highlighted={isHighlighted(r)}
                onCancel={askCancel}
                onReschedule={goReschedule}
              />
            ))}
          </div>
        </>
      )}

      {!loading && !error && past.length > 0 && (
        <>
          <div style={{ margin: '22px 0 10px' }}>
            <div className="eyebrow eyebrow--muted">{t('past')}</div>
          </div>
          <div className="grid">
            {past.map((r) => (
              <ResCard
                key={r.id}
                r={r}
                courtLabel={courtLabel(r)}
                upcoming={false}
                highlighted={isHighlighted(r)}
                onCancel={askCancel}
                onReschedule={goReschedule}
              />
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}
