import { useI18n } from '../../../i18n';
import { Icon } from '../../../shared/ui';
import styles from './ProductShot.module.css';

export type ProductShotVariant = 'schedule' | 'search' | 'booking';

interface ProductShotProps {
  variant: ProductShotVariant;
  className?: string;
}

/**
 * A miniature of real MatchPoint UI, drawn with the app's own tokens.
 *
 * §13 asks for product screenshots rather than generic illustrations. Committed
 * PNGs would be genuinely real, but they freeze one theme and one language on a
 * page that has to work in four combinations of both, and they go stale the
 * first time a screen changes. Rebuilding the screens small keeps them correct
 * in light and dark, translated with everything else, and crisp at any zoom.
 *
 * Announced as a single image: the shapes inside are decorative, and the label
 * says what the picture shows rather than making a reader walk a fake table.
 */
export function ProductShot({ variant, className }: ProductShotProps) {
  const { t } = useI18n();

  const label =
    variant === 'schedule'
      ? t('fc_shot_schedule_alt')
      : variant === 'search'
        ? t('fc_shot_search_alt')
        : t('fc_shot_booking_alt');

  return (
    <div className={[styles.frame, className].filter(Boolean).join(' ')} role="img" aria-label={label}>
      <div className={styles.chrome} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.chromeTitle}>matchpoint.bg</span>
      </div>

      <div className={styles.body} aria-hidden="true">
        {variant === 'schedule' && <ScheduleShot />}
        {variant === 'search' && <SearchShot />}
        {variant === 'booking' && <BookingShot />}
      </div>
    </div>
  );
}

const ROW_SLOTS = 8;

interface ScheduleCell {
  start: number;
  width: number;
  booked: boolean;
}

/** Walks a row's booked spans into contiguous cells covering all eight slots. */
function buildRow(spans: [number, number][]): ScheduleCell[] {
  const cells: ScheduleCell[] = [];
  let slot = 0;

  while (slot < ROW_SLOTS) {
    const span = spans.find(([start]) => start === slot);
    if (span) {
      const width = Math.min(span[1], ROW_SLOTS - slot);
      cells.push({ start: slot, width, booked: true });
      slot += width;
    } else {
      cells.push({ start: slot, width: 1, booked: false });
      slot += 1;
    }
  }

  return cells;
}

/** The club workspace day view: courts down the side, half-hours across. */
function ScheduleShot() {
  const { t } = useI18n();
  const courts = [t('fc_shot_court_1'), t('fc_shot_court_2'), t('fc_shot_court_3')];
  // Booked spans per court as [startSlot, width] over an eight-slot row.
  const booked: [number, number][][] = [
    [[1, 2], [5, 2]],
    [[2, 3]],
    [[0, 2], [6, 2]],
  ];

  return (
    <div className={styles.schedule}>
      <div className={styles.scheduleHead}>
        <span className={styles.scheduleTitle}>{t('fc_shot_schedule_title')}</span>
        <span className={styles.pill}>{t('fc_shot_today')}</span>
      </div>

      <div className={styles.times}>
        <span />
        {['09', '10', '11', '12'].map((hour) => (
          <span key={hour} className={styles.time}>
            {hour}:00
          </span>
        ))}
      </div>

      {courts.map((court, row) => (
        <div key={court} className={styles.courtRow}>
          <span className={styles.courtName}>{court}</span>
          {/*
            A booked stretch is one element spanning its slots, not one element
            per half-hour: the label has to sit across the whole booking, which
            is also how the real schedule draws it.
          */}
          <div className={styles.slots}>
            {buildRow(booked[row] ?? []).map((cell) => (
              <span
                key={cell.start}
                className={[styles.slot, cell.booked ? styles.slotBooked : styles.slotFree].join(' ')}
                style={{ gridColumn: `span ${cell.width}` }}
              >
                {cell.booked && <span className={styles.slotLabel}>{t('fc_shot_booked')}</span>}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** What a player sees: a club result with its free slots for the day. */
function SearchShot() {
  const { t } = useI18n();

  return (
    <div className={styles.search}>
      <div className={styles.searchBar}>
        <Icon name="search" className={styles.searchIcon} />
        <span className={styles.searchText}>{t('fc_shot_search_query')}</span>
      </div>

      {[
        { name: t('fc_shot_club_1'), price: '24' },
        { name: t('fc_shot_club_2'), price: '30' },
      ].map((club) => (
        <div key={club.name} className={styles.result}>
          <span className={styles.thumb} />
          <div className={styles.resultBody}>
            <span className={styles.resultName}>{club.name}</span>
            <span className={styles.resultMeta}>{t('fc_shot_result_meta')}</span>
            <div className={styles.chips}>
              {['09:00', '10:30', '18:00'].map((slot) => (
                <span key={slot} className={styles.slotChip}>
                  {slot}
                </span>
              ))}
            </div>
          </div>
          <span className={styles.price}>{club.price} лв</span>
        </div>
      ))}
    </div>
  );
}

/** The confirmation a player keeps, and the club sees in its bookings list. */
function BookingShot() {
  const { t } = useI18n();

  return (
    <div className={styles.booking}>
      <div className={styles.bookingHead}>
        <span className={styles.badge}>{t('fc_shot_confirmed')}</span>
        <span className={styles.bookingRef}>MP-4KQ7</span>
      </div>
      <span className={styles.bookingTitle}>{t('fc_shot_club_1')}</span>
      <span className={styles.bookingMeta}>{t('fc_shot_booking_when')}</span>

      <div className={styles.bookingRows}>
        {[
          [t('fc_shot_booking_court'), t('fc_shot_court_2')],
          [t('fc_shot_booking_player'), 'Georgi D.'],
          [t('fc_shot_booking_total'), '24 лв'],
        ].map(([key, value]) => (
          <div key={key} className={styles.bookingRow}>
            <span>{key}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
