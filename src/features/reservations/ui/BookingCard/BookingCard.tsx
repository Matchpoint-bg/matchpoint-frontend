import { useI18n } from '../../../../i18n';
import { buildIcs, downloadIcs } from '../../../../shared/lib/calendar';
import { fmt } from '../../../../shared/lib/format';
import { directionsUrl } from '../../../../shared/lib/maps';
import { BookingStatus, Button, DateTime, Icon, LinkButton, Price } from '../../../../shared/ui';
import { bookingCalendarEvent } from '../../model/bookingCalendar';
import type { BookingView } from '../../model/bookingView.types';
import styles from './BookingCard.module.css';

interface BookingCardProps {
  view: BookingView;
  onView: (view: BookingView) => void;
  onCancel: (view: BookingView) => void;
  onReschedule: (view: BookingView) => void;
}

/**
 * One booking in the list: who, where, when, how much, and what can still be
 * done about it. Past bookings keep only "View" — there is nothing to move or
 * release once the match has been played.
 */
export function BookingCard({ view, onView, onCancel, onReschedule }: BookingCardProps) {
  const { t, lang } = useI18n();
  const upcoming = view.status === 'confirmed';
  const directions = directionsUrl({
    address: view.clubAddress,
    name: view.clubName,
    ...(view.latitude !== undefined ? { latitude: view.latitude } : {}),
    ...(view.longitude !== undefined ? { longitude: view.longitude } : {}),
  });

  const addToCalendar = () =>
    downloadIcs(
      `${view.reference}.ics`,
      buildIcs(bookingCalendarEvent(view, { referenceLabel: t('booking_reference') })),
    );

  return (
    <article className="card">
      <div className={styles.row}>
        <div className={styles.calendar} aria-hidden="true">
          <small>{fmt.mon(view.start, lang)}</small>
          <b>{fmt.dayNum(view.start)}</b>
          <small>{fmt.weekday(view.start, lang)}</small>
        </div>

        <div className={styles.main}>
          <div className={styles.heading}>
            <h3>{view.clubName}</h3>
            <BookingStatus status={view.status} size="sm" />
          </div>
          <p className={styles.court}>{view.courtName}</p>

          <div className={styles.details}>
            <span>
              <Icon name="clock" />
              <DateTime value={view.start} end={view.end} /> · {view.durationMinutes}
              {t('min')}
            </span>
            {view.clubAddress && (
              <span>
                <Icon name="pin" />
                {view.clubAddress}
              </span>
            )}
            {view.price !== null && (
              <span>
                <Icon name="tag" />
                <Price value={view.price} />
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="outline" size="sm" icon="ticket" onClick={() => onView(view)}>
          {t('view_booking')}
        </Button>
        {upcoming && (
          <>
            <LinkButton
              href={directions}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              size="sm"
              icon="pin"
            >
              {t('club_directions')}
            </LinkButton>
            <Button variant="ghost" size="sm" icon="calendar" onClick={addToCalendar}>
              {t('add_to_calendar')}
            </Button>
            {/* The club is what the reschedule flow needs; until it resolves
                there is nowhere to send the player. */}
            <Button
              variant="ghost"
              size="sm"
              icon="clock"
              disabled={view.clubId === null}
              onClick={() => onReschedule(view)}
            >
              {t('reschedule')}
            </Button>
            <Button variant="danger" size="sm" icon="trash" onClick={() => onCancel(view)}>
              {t('cancel')}
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
