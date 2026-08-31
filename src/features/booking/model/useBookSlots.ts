import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import {
  useCreateReservationMutation,
  useUpdateReservationMutation,
} from '../../reservations';
import { useI18n } from '../../../i18n';
import { useToast } from '../../../shared/ui/Toast';
import type { Slot } from '../../courts';

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
 * Commits a slot run to a reservation. Shared by the club availability module
 * and the (reschedule-only) court page so there is one booking code path.
 */
export function useBookSlots() {
  const { t } = useI18n();
  const { authed } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const createReservation = useCreateReservationMutation();
  const updateReservation = useUpdateReservationMutation();

  async function book({ courtId, first, last, total, date, rescheduleId, onDone }: BookArgs) {
    // Browsing the grid is public; committing to a slot isn't. Send them back here after.
    if (!authed) {
      navigate('/login', { state: { from: location } });
      return;
    }
    const body = { court: courtId, start_datetime: first.start, end_datetime: last.end };
    try {
      if (rescheduleId !== null && rescheduleId !== undefined) {
        await updateReservation.mutateAsync({ id: rescheduleId, body });
        toast(t('rescheduled_toast'), 'ok');
        // Land on the booking that just moved, rather than leaving the user on the grid.
        navigate('/reservations', { state: { highlight: { id: rescheduleId, start: null } } });
        return;
      }
      const created = await createReservation.mutateAsync({ body, meta: { amt: total, date } });
      toast(t('booked_toast'), 'ok');
      onDone?.();
      // POST /api/reservations/ answers with a serializer that omits the new id, so the
      // start time is the only handle we have on the row we just created.
      navigate('/reservations', {
        state: { highlight: { id: created?.id ?? null, start: body.start_datetime } },
      });
    } catch (err) {
      const fallback = rescheduleId != null ? t('reschedule_fail') : t('book_fail');
      toast(err instanceof Error ? err.message : fallback, 'err');
    }
  }

  return {
    book,
    authed,
    pending: createReservation.isPending || updateReservation.isPending,
  };
}
