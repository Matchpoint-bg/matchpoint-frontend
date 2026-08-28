import type { Reservation } from '../../model/reservation.types';
import { ReservationCard } from '../ReservationCard';
import styles from './ReservationGroup.module.css';

interface ReservationGroupProps {
  label: string;
  reservations: Reservation[];
  upcoming: boolean;
  courtLabel: (reservation: Reservation) => string;
  isHighlighted: (reservation: Reservation) => boolean;
  onCancel: (reservation: Reservation) => void;
  onReschedule: (reservation: Reservation) => void;
}

export function ReservationGroup(props: ReservationGroupProps) {
  if (props.reservations.length === 0) return null;

  return (
    <section>
      <div className={styles.heading}>
        <div className="eyebrow eyebrow--muted">{props.label}</div>
      </div>
      <div className="grid">
        {props.reservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            courtLabel={props.courtLabel(reservation)}
            upcoming={props.upcoming}
            highlighted={props.isHighlighted(reservation)}
            onCancel={props.onCancel}
            onReschedule={props.onReschedule}
          />
        ))}
      </div>
    </section>
  );
}
