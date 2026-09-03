import type { ReactNode } from 'react';
import type { BookingView } from '../../model/bookingView.types';
import { BookingCard } from '../BookingCard';
import styles from './BookingList.module.css';

interface BookingListProps {
  views: BookingView[];
  /** Shown in place of the list — each tab says something different. */
  empty: ReactNode;
  onView: (view: BookingView) => void;
  onCancel: (view: BookingView) => void;
  onReschedule: (view: BookingView) => void;
}

export function BookingList({ views, empty, onView, onCancel, onReschedule }: BookingListProps) {
  if (views.length === 0) return <>{empty}</>;

  return (
    <div className={styles.list}>
      {views.map((view) => (
        <BookingCard
          key={view.id}
          view={view}
          onView={onView}
          onCancel={onCancel}
          onReschedule={onReschedule}
        />
      ))}
    </div>
  );
}
