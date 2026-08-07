import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { SectionHead, Shell } from '../components/Shell';
import { EmptyState, ErrorState, Spinner } from '../components/States';
import { useI18n } from '../i18n';
import { useSettings } from '../context/SettingsContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { api } from '../lib/api';
import { courtName } from '../lib/demo';
import { fmt } from '../lib/format';
import type { Reservation } from '../types';

function ResCard({
  r,
  upcoming,
  onCancel,
}: {
  r: Reservation;
  upcoming: boolean;
  onCancel: (r: Reservation) => void;
}) {
  const { t, lang } = useI18n();
  const dur = Math.round(
    (new Date(r.end_datetime).getTime() - new Date(r.start_datetime).getTime()) / 60000,
  );

  return (
    <div className="card">
      <div className="res-row">
        <div className="res-cal">
          <small>{fmt.mon(r.start_datetime, lang)}</small>
          <b>{fmt.dayNum(r.start_datetime)}</b>
          <small>{fmt.weekday(r.start_datetime, lang)}</small>
        </div>
        <div className="res-main">
          <h3>{courtName(r.court, t('tennis_court'))}</h3>
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
            <button className="btn btn--danger btn--sm" title={t('cancel')} onClick={() => onCancel(r)}>
              <Icon name="trash" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CancelBody({
  r,
  onConfirm,
  onKeep,
}: {
  r: Reservation;
  onConfirm: () => Promise<void>;
  onKeep: () => void;
}) {
  const { t, lang } = useI18n();
  return (
    <div>
      <p style={{ margin: '0 0 18px', color: 'var(--ink-2)' }}>
        {t('cancel_confirm')} <b>{courtName(r.court, t('tennis_court'))}</b> {t('on')}{' '}
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
  const { demo, staff } = useSettings();
  const { openModal, closeModal } = useModal();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data, error, loading, reload } = useAsync(async () => {
    const res = await api.reservations();
    return res
      .slice()
      .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());
  }, [demo]);

  function askCancel(r: Reservation) {
    openModal(
      t('cancel_title'),
      <CancelBody
        r={r}
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

  const now = Date.now();
  const upcoming = (data ?? []).filter((r) => new Date(r.end_datetime).getTime() >= now);
  const past = (data ?? []).filter((r) => new Date(r.end_datetime).getTime() < now);

  return (
    <Shell active="reservations">
      <SectionHead
        eyebrow={t('reservations_eyebrow')}
        title={t('reservations_h2')}
        {...(staff ? { sub: t('staff_res_note') } : {})}
      >
        <button className="btn btn--soft btn--sm" onClick={() => navigate('/clubs')}>
          <Icon name="plus" />
          {t('book_more')}
        </button>
      </SectionHead>

      {loading && <Spinner />}
      {!loading && error && <ErrorState msg={error} onRetry={reload} />}

      {!loading && !error && data?.length === 0 && (
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
              <ResCard key={r.id} r={r} upcoming onCancel={askCancel} />
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
              <ResCard key={r.id} r={r} upcoming={false} onCancel={askCancel} />
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}
