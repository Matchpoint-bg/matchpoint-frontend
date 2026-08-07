import { useState } from 'react';
import { Icon } from '../Icons';
import { EmptyState, ErrorState, Spinner } from '../States';
import { useI18n, API_WEEKDAYS } from '../../i18n';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { api } from '../../lib/api';
import { fmt } from '../../lib/format';
import type { Club, Court, Price, Surface } from '../../types';

/** Shared save/cancel plumbing: disables the button while the request is in flight. */
function useSaveAction(onDone: () => void) {
  const { closeModal } = useModal();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>, okMsg: string) => {
    setBusy(true);
    try {
      await fn();
      toast(okMsg, 'ok');
      closeModal();
      onDone();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'err');
      setBusy(false);
    }
  };

  return { busy, run, closeModal };
}

export function EditClubModal({ club, onDone }: { club: Club; onDone: () => void }) {
  const { t } = useI18n();
  const { busy, run } = useSaveAction(onDone);
  const [form, setForm] = useState({
    name: club.name,
    address: club.address ?? '',
    description: club.description ?? '',
    phone: club.phone ?? '',
    email: club.email ?? '',
  });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="field">
        <label>{t('label_name')}</label>
        <input value={form.name} onChange={set('name')} />
      </div>
      <div className="field">
        <label>{t('label_address')}</label>
        <input value={form.address} onChange={set('address')} />
      </div>
      <div className="field">
        <label>{t('label_description')}</label>
        <input value={form.description} onChange={set('description')} />
      </div>
      <div className="field">
        <div className="row2">
          <div>
            <label>{t('phone')}</label>
            <input value={form.phone} onChange={set('phone')} />
          </div>
          <div>
            <label>{t('email')}</label>
            <input value={form.email} onChange={set('email')} />
          </div>
        </div>
      </div>
      <button
        className="btn btn--primary btn--block"
        disabled={busy}
        onClick={() => run(() => api.updateClub(club.id, form), t('club_updated'))}
      >
        <Icon name="check" />
        {t('save_changes')}
      </button>
    </div>
  );
}

export function OpeningHoursModal({ clubId, onDone }: { clubId: number; onDone: () => void }) {
  const { t, weekdays } = useI18n();
  const { busy, run } = useSaveAction(onDone);
  const [weekday, setWeekday] = useState<string>(API_WEEKDAYS[0]);
  const [opening, setOpening] = useState('08:00');
  const [closing, setClosing] = useState('22:00');

  return (
    <div>
      <div className="field">
        <label>{t('weekday')}</label>
        <select value={weekday} onChange={(e) => setWeekday(e.target.value)}>
          {API_WEEKDAYS.map((d, i) => (
            <option key={d} value={d}>
              {weekdays[i]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <div className="row2">
          <div>
            <label>{t('opens')}</label>
            <input type="time" step={1800} value={opening} onChange={(e) => setOpening(e.target.value)} />
          </div>
          <div>
            <label>{t('closes')}</label>
            <input type="time" step={1800} value={closing} onChange={(e) => setClosing(e.target.value)} />
          </div>
        </div>
      </div>
      <p className="small-note">{t('time_30min_hint')}</p>
      <button
        className="btn btn--primary btn--block"
        disabled={busy}
        onClick={() =>
          run(
            () =>
              api.addOpeningHour(clubId, {
                weekday,
                opening_hour: `${opening}:00`,
                closing_hour: `${closing}:00`,
              }),
            t('oh_added'),
          )
        }
      >
        <Icon name="plus" />
        {t('add_opening_hours')}
      </button>
    </div>
  );
}

export function EmployeesModal({ clubId }: { clubId: number }) {
  const { t } = useI18n();
  const { data, error, loading, reload } = useAsync(() => api.clubEmployees(clubId), [clubId]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState msg={error} onRetry={reload} />;
  if (!data?.length) return <EmptyState title={t('no_staff_title')} desc={t('no_staff_desc')} icon="users" />;

  return (
    <div>
      {data.map((e, i) => (
        <div key={i} className="res-row" style={{ padding: '10px 0' }}>
          <div className="avatar" style={{ background: 'var(--pale)', color: 'var(--ink)' }}>
            {((e.first_name || '?')[0] || '?').toUpperCase()}
          </div>
          <div className="res-main">
            <h3 style={{ fontSize: 15 }}>
              {`${e.first_name || ''} ${e.last_name || ''}`.trim()}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
}

const SURFACES: Surface[] = ['Clay', 'Grass', 'Hard'];

export function CourtFormModal({
  court,
  clubId,
  onDone,
}: {
  court: Court | null;
  clubId: number | undefined;
  onDone: () => void;
}) {
  const { t } = useI18n();
  const { busy, run } = useSaveAction(onDone);
  const editing = Boolean(court);

  const [form, setForm] = useState({
    name: court?.name ?? '',
    surface_type: (court?.surface_type as Surface) ?? 'Clay',
    sport_type: court?.sport_type ?? 'Tennis',
    is_indoor: court?.is_indoor ?? false,
    is_lit: court?.is_lit ?? false,
  });

  return (
    <div>
      <div className="field">
        <label>{t('court_name')}</label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Court 1 — Centre"
        />
      </div>
      <div className="field">
        <label>{t('surface')}</label>
        <select
          value={form.surface_type}
          onChange={(e) => setForm((f) => ({ ...f, surface_type: e.target.value as Surface }))}
        >
          {SURFACES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>{t('sport')}</label>
        <select
          value={form.sport_type}
          onChange={(e) => setForm((f) => ({ ...f, sport_type: e.target.value }))}
        >
          <option value="Tennis">Tennis</option>
        </select>
      </div>
      <div className="toggle">
        <div className="t">
          <b>{t('indoor')}</b>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={form.is_indoor}
            onChange={(e) => setForm((f) => ({ ...f, is_indoor: e.target.checked }))}
          />
          <span className="track" />
        </label>
      </div>
      <div className="toggle">
        <div className="t">
          <b>{t('floodlit')}</b>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={form.is_lit}
            onChange={(e) => setForm((f) => ({ ...f, is_lit: e.target.checked }))}
          />
          <span className="track" />
        </label>
      </div>
      <button
        className="btn btn--primary btn--block"
        style={{ marginTop: 6 }}
        disabled={busy}
        onClick={() =>
          run(async () => {
            const body = { ...form, club_id: clubId };
            if (court) await api.updateCourt(court.id, body);
            else await api.createCourt(body);
          }, editing ? t('court_saved') : t('court_created'))
        }
      >
        <Icon name="check" />
        {editing ? t('save_court') : t('create_court')}
      </button>
    </div>
  );
}

export function DeleteCourtModal({ court, onDeleted }: { court: Court; onDeleted: () => void }) {
  const { t } = useI18n();
  const { busy, run, closeModal } = useSaveAction(onDeleted);

  return (
    <div>
      <p style={{ margin: '0 0 18px', color: 'var(--ink-2)' }}>
        {t('delete_word')} <b>{court.name}</b>
        {t('delete_court_confirm')}
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn--outline btn--block" onClick={closeModal}>
          {t('keep')}
        </button>
        <button
          className="btn btn--danger btn--block"
          disabled={busy}
          onClick={() => run(() => api.deleteCourt(court.id), t('court_deleted'))}
        >
          <Icon name="trash" />
          {t('delete_court')}
        </button>
      </div>
    </div>
  );
}

export function PricesModal({ courtId }: { courtId: number }) {
  const { t, weekdays } = useI18n();
  const { busy, run } = useSaveAction(() => {});
  const { data, error, loading, reload } = useAsync(() => api.prices(courtId), [courtId]);
  const [rows, setRows] = useState<Price[] | null>(null);

  if (loading) return <Spinner />;
  if (error) return <ErrorState msg={error} onRetry={reload} />;

  const current =
    rows ??
    (data?.length
      ? data
      : [{ weekday: API_WEEKDAYS[0], time_start: '08:00', time_end: '18:00', price_per_30_minutes: 8 }]);

  const update = (i: number, patch: Partial<Price>) =>
    setRows(current.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <div>
      <p className="small-note" style={{ marginTop: 0 }}>
        {t('price_hint')}
      </p>

      {current.map((p, i) => (
        <div key={i} className="card card--pad" style={{ marginBottom: 10 }}>
          <div className="field" style={{ marginBottom: 8 }}>
            <label>{t('weekday')}</label>
            <select value={p.weekday} onChange={(e) => update(i, { weekday: e.target.value })}>
              {API_WEEKDAYS.map((d, di) => (
                <option key={d} value={d}>
                  {weekdays[di]}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 8 }}>
            <div className="row2">
              <div>
                <label>{t('from')}</label>
                <input
                  type="time"
                  step={1800}
                  value={p.time_start.slice(0, 5)}
                  onChange={(e) => update(i, { time_start: e.target.value })}
                />
              </div>
              <div>
                <label>{t('to')}</label>
                <input
                  type="time"
                  step={1800}
                  value={p.time_end.slice(0, 5)}
                  onChange={(e) => update(i, { time_end: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>{t('price30')}</label>
            <input
              type="number"
              step={0.5}
              value={p.price_per_30_minutes}
              onChange={(e) => update(i, { price_per_30_minutes: parseFloat(e.target.value) })}
            />
          </div>
          <button
            className="btn btn--danger btn--sm"
            style={{ marginTop: 8 }}
            onClick={() => setRows(current.filter((_, idx) => idx !== i))}
          >
            <Icon name="trash" />
            {t('remove')}
          </button>
        </div>
      ))}

      <button
        className="btn btn--outline btn--sm"
        onClick={() =>
          setRows([
            ...current,
            { weekday: API_WEEKDAYS[0], time_start: '08:00', time_end: '18:00', price_per_30_minutes: 8 },
          ])
        }
      >
        <Icon name="plus" />
        {t('add_price_band')}
      </button>

      <button
        className="btn btn--primary btn--block"
        style={{ marginTop: 12 }}
        disabled={busy}
        onClick={() =>
          run(
            () =>
              api.setPrices(
                courtId,
                current.map((r) => ({
                  ...r,
                  time_start: `${r.time_start.slice(0, 5)}:00`,
                  time_end: `${r.time_end.slice(0, 5)}:00`,
                })),
              ),
            t('prices_saved'),
          )
        }
      >
        <Icon name="check" />
        {t('save_prices')}
      </button>
    </div>
  );
}

export function UnavailabilityModal({ courtId, onDone }: { courtId: number; onDone: () => void }) {
  const { t } = useI18n();
  const { busy, run } = useSaveAction(onDone);
  const today = fmt.isoDate(new Date());

  const [sd, setSd] = useState(today);
  const [st, setSt] = useState('09:00');
  const [ed, setEd] = useState(today);
  const [et, setEt] = useState('11:00');

  return (
    <div>
      <p className="small-note" style={{ marginTop: 0 }}>
        {t('block_hint')}
      </p>
      <div className="field">
        <div className="row2">
          <div>
            <label>{t('start_date')}</label>
            <input type="date" value={sd} onChange={(e) => setSd(e.target.value)} />
          </div>
          <div>
            <label>{t('start_time')}</label>
            <input type="time" step={1800} value={st} onChange={(e) => setSt(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="field">
        <div className="row2">
          <div>
            <label>{t('end_date')}</label>
            <input type="date" value={ed} onChange={(e) => setEd(e.target.value)} />
          </div>
          <div>
            <label>{t('end_time')}</label>
            <input type="time" step={1800} value={et} onChange={(e) => setEt(e.target.value)} />
          </div>
        </div>
      </div>
      <button
        className="btn btn--primary btn--block"
        disabled={busy}
        onClick={() =>
          run(
            () =>
              api.addUnavailability(courtId, {
                start_datetime: `${sd}T${st}:00`,
                end_datetime: `${ed}T${et}:00`,
              }),
            t('time_blocked'),
          )
        }
      >
        <Icon name="ban" />
        {t('block_this_time')}
      </button>
    </div>
  );
}
