import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { useUpdateReservationMutation } from '../../reservations';
import { useI18n } from '../../../i18n';
import { useToast } from '../../../shared/ui/Toast';
import type { Slot } from '../../courts';
import { useConfirmBooking } from './useConfirmBooking';

interface BookArgs {
  courtId: number;
  first: Slot;
  last: Slot;
  total: number;
  date: string;
  /** Reservation being moved, when the caller is in reschedule mode. */
  rescheduleId?: number | null;
  onDone?: () => void;
}

/**
 * The court page's write path: reschedule here, create through
 * `useConfirmBooking` (ToDoRedesign §11 keeps a single place that POSTs a
 * reservation). Reschedule moves to the review flow in Phase 5 (§12), and this
 * hook retires with it.
 */
export function useBookSlots() {
  const { t } = useI18n();
  const { authed } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const updateReservation = useUpdateReservationMutation();
  const { confirm, pending: confirming } = useConfirmBooking();

  async function book({ courtId, first, last, total, date, rescheduleId, onDone }: BookArgs) {
    // Browsing the grid is public; committing to a slot isn't. Send them back here after.
    if (!authed) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (rescheduleId !== null && rescheduleId !== undefined) {
      const body = { court: courtId, start_datetime: first.start, end_datetime: last.end };
      try {
        await updateReservation.mutateAsync({ id: rescheduleId, body });
        toast(t('rescheduled_toast'), 'ok');
        // Land on the booking that just moved, rather than leaving the user on the grid.
        navigate('/reservations', { state: { highlight: { id: rescheduleId, start: null } } });
      } catch (err) {
        toast(err instanceof Error ? err.message : t('reschedule_fail'), 'err');
      }
      return;
    }

    const minutes = Math.round(
      (new Date(last.end).getTime() - new Date(first.start).getTime()) / 60_000,
    );
    const result = await confirm({
      courtId,
      date,
      start: first.start,
      end: last.end,
      minutes,
      price: total,
    });
    if (result.ok) {
      onDone?.();
      return;
    }
    // This screen has no failure surface of its own — the review page owns that
    // (§11); here the message is all there is.
    toast(result.message ?? t('book_fail'), 'err');
  }

  return {
    book,
    authed,
    pending: confirming || updateReservation.isPending,
  };
}
