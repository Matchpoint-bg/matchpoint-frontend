import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { BookingIntentCard, bookingIntentStore } from '../../features/booking';
import { useI18n } from '../../i18n';
import { Button, EmptyState, Icon, LinkButton, StatusBadge } from '../../shared/ui';
import styles from './BookingConfirmationPage.module.css';

export function BookingConfirmationPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { t } = useI18n();
  const snapshot = useMemo(() => bookingIntentStore.confirmation(id), [id]);

  if (!snapshot) {
    return (
      <AppShell active="reservations">
        <EmptyState
          title={t('confirmation_missing_title')}
          desc={t('confirmation_missing_desc')}
          icon="ticket"
        >
          <Button onClick={() => navigate('/reservations')}>{t('my_reservations')}</Button>
        </EmptyState>
      </AppShell>
    );
  }

  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${snapshot.bookingReference}@matchpoint.bg`,
    `DTSTART:${snapshot.start.replace(/[-:]/g, '').replace('.000', '')}`,
    `DTEND:${snapshot.end.replace(/[-:]/g, '').replace('.000', '')}`,
    `SUMMARY:Tennis at ${snapshot.clubName}`,
    `LOCATION:${snapshot.clubAddress}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const calendarHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(calendar)}`;
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(snapshot.clubAddress)}`;

  return (
    <AppShell active="reservations">
      <header className={styles.success}>
        <span className={styles.icon}><Icon name="check" /></span>
        <div>
          <span className="eyebrow">{t('confirmation_eyebrow')}</span>
          <h1>{t('confirmation_title')}</h1>
          <div className={styles.reference}>
            <span>{t('booking_reference')}: <strong>{snapshot.bookingReference}</strong></span>
            <StatusBadge label={t('status_confirmed')} tone="success" />
          </div>
        </div>
      </header>

      <BookingIntentCard intent={snapshot} />

      <div className={styles.actions}>
        <LinkButton href={calendarHref} download={`${snapshot.bookingReference}.ics`} icon="calendar">
          {t('add_to_calendar')}
        </LinkButton>
        <LinkButton href={directions} target="_blank" rel="noreferrer" variant="outline" icon="pin">
          {t('club_directions')}
        </LinkButton>
        <LinkButton to="/reservations" variant="outline" icon="ticket">
          {t('my_reservations')}
        </LinkButton>
      </div>
    </AppShell>
  );
}
