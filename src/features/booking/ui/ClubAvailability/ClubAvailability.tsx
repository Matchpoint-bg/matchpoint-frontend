import { useMemo, useState } from 'react';
import { useI18n } from '../../../../i18n';
import { fmt } from '../../../../shared/lib/format';
import { Button, DateField, EmptyState, ErrorState, Field, Icon, Select, Skeleton, SurfaceBadge } from '../../../../shared/ui';
import type { Club } from '../../../clubs';
import type { CourtAvailability } from '../../model/availability.types';
import type { BookingIntent } from '../../model/bookingIntent.types';
import { useClubAvailabilityQuery } from '../../model/availability.queries';
import { useClubSlotSelection } from '../../model/useClubSlotSelection';
import { AvailabilityLegend } from '../AvailabilityLegend';
import { SlotGrid } from '../SlotGrid';
import styles from './ClubAvailability.module.css';

type EnvironmentFilter = 'all' | 'indoor' | 'outdoor';

interface ClubAvailabilityProps {
  club: Club;
  date: string;
  onDateChange: (date: string) => void;
  onReview: (intent: BookingIntent) => void;
}

function availableCount(row: CourtAvailability): number {
  return row.slots.filter((slot) => slot.status === 'available').length;
}

export function ClubAvailability({ club, date, onDateChange, onReview }: ClubAvailabilityProps) {
  const { t } = useI18n();
  const query = useClubAvailabilityQuery(club.id, date);
  const rows = query.data?.courts ?? [];
  const selection = useClubSlotSelection(rows, `${club.id}|${date}`);
  const [surface, setSurface] = useState('all');
  const [environment, setEnvironment] = useState<EnvironmentFilter>('all');

  const surfaces = useMemo(
    () => [...new Set(rows.map((row) => row.court.surface_type))].sort(),
    [rows],
  );
  const filtered = rows.filter((row) => {
    if (surface !== 'all' && row.court.surface_type !== surface) return false;
    if (environment === 'indoor' && !row.court.is_indoor) return false;
    if (environment === 'outdoor' && row.court.is_indoor) return false;
    return true;
  });
  const hasAvailable = filtered.some((row) => availableCount(row) > 0);

  const review = () => {
    const chosen = selection.selection;
    if (!chosen) return;
    const intent: BookingIntent = {
      version: 1,
      clubId: club.id,
      clubName: club.name,
      clubAddress: club.address || club.city || '',
      courtId: chosen.court.id,
      courtName: chosen.court.name,
      surface: chosen.court.surface_type,
      date,
      start: chosen.first.start,
      end: chosen.last.end,
      durationMinutes: chosen.count * (query.data?.slot_minutes ?? 30),
      quotedPrice: chosen.total,
      currency: 'BGN',
      cancellationPolicy:
        club.cancellation_policy || 'Free cancellation up to 24 hours before the booking.',
      paymentMethod: 'pay_on_site',
      createdAt: new Date().toISOString(),
    };
    onReview(intent);
  };

  return (
    <section className={styles.section} aria-labelledby="club-availability-title">
      <div className={styles.heading}>
        <div>
          <span className="eyebrow">{t('availability_eyebrow')}</span>
          <h2 id="club-availability-title">{t('availability_title')}</h2>
          <p>{t('availability_desc')}</p>
        </div>
        {query.data && <span className={styles.timezone}>{query.data.timezone}</span>}
      </div>

      <div className={styles.controls}>
        <Field label={t('choose_surface')}>
          {(control) => (
            <Select
              {...control}
              icon="court"
              value={surface}
              onChange={(event) => {
                setSurface(event.target.value);
                selection.clear();
              }}
            >
              <option value="all">{t('all_surfaces')}</option>
              {surfaces.map((item) => <option key={item} value={item}>{item}</option>)}
            </Select>
          )}
        </Field>

        <Field label={t('court_type')}>
          {(control) => (
            <Select
              {...control}
              icon="indoor"
              value={environment}
              onChange={(event) => {
                setEnvironment(event.target.value as EnvironmentFilter);
                selection.clear();
              }}
            >
              <option value="all">{t('filter_all_courts')}</option>
              <option value="indoor">{t('filter_indoor')}</option>
              <option value="outdoor">{t('filter_outdoor')}</option>
            </Select>
          )}
        </Field>

        <Field label={t('search_date')} required>
          {(control) => (
            <DateField
              {...control}
              min={fmt.isoDate(new Date())}
              value={date}
              onChange={(event) => {
                if (event.target.value) onDateChange(event.target.value);
              }}
            />
          )}
        </Field>
      </div>

      <AvailabilityLegend />

      {query.isPending && (
        <div className={styles.loading} aria-label={t('loading')}>
          <Skeleton height={190} count={2} />
        </div>
      )}
      {!query.isPending && query.error && (
        <ErrorState msg={query.error.message} onRetry={() => void query.refetch()} />
      )}
      {!query.isPending && !query.error && (!hasAvailable || filtered.length === 0) && (
        <EmptyState
          title={t('no_availability_title')}
          desc={t('no_availability_desc')}
          icon="clock"
        />
      )}

      {!query.isPending && !query.error && hasAvailable && (
        <div className={styles.courts}>
          {filtered.map((row) => (
            <article key={row.court.id} className={styles.court}>
              <div className={styles.courtHeading}>
                <div>
                  <h3>{row.court.name}</h3>
                  <div className={styles.courtFacts}>
                    <SurfaceBadge surface={row.court.surface_type} />
                    <span><Icon name="indoor" />{row.court.is_indoor ? t('indoor') : t('outdoor')}</span>
                    {row.court.is_lit && <span><Icon name="bulb" />{t('floodlit')}</span>}
                  </div>
                </div>
                <span className={styles.openCount}>{availableCount(row)} {t('open')}</span>
              </div>
              <SlotGrid
                slots={row.slots}
                selected={selection.selected(row.court.id)}
                loading={false}
                error={null}
                onToggle={(index) => selection.toggle(row.court.id, index)}
                onRetry={() => undefined}
              />
            </article>
          ))}
        </div>
      )}

      {selection.selection && (
        <div className={styles.summary} role="status" aria-live="polite">
          <div className={styles.summaryInner}>
            <div>
              <strong>{selection.selection.court.name}</strong>
              <span>
                {fmt.time(selection.selection.first.start)}–{fmt.time(selection.selection.last.end)}
                {' · '}{selection.selection.count * 30} {t('min')}
              </span>
            </div>
            <strong className={styles.price}>{fmt.money(selection.selection.total)}</strong>
            <Button icon="arrowRight" iconPosition="end" onClick={review}>
              {t('review_booking')}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
