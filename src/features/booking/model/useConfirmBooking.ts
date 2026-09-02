import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../../i18n';
import { queryScope } from '../../../shared/api/queryScope';
import { useToast } from '../../../shared/ui/Toast';
import { reservationsApi } from '../../reservations/api/reservations.api';
import { reservationKeys, useCreateReservationMutation } from '../../reservations/model/reservation.queries';
import type { CreateReservationBody, Reservation } from '../../reservations/model/reservation.types';
import { forgetIntent } from './bookingIntent';
import { classifyConfirmFailure } from './confirmFailure';
import type { ConfirmFailure } from './confirmFailure';

export interface ConfirmArgs {
  courtId: number;
  /** Known when the caller came from an intent; the confirmation page can fall back to the court. */
  clubId?: number;
  /** Local `YYYY-MM-DD` of the booked day, for the demo store. */
  date: string;
  start: string;
  end: string;
  minutes: number;
  price: number;
}

export type ConfirmResult =
  | { ok: true }
  | { ok: false; failure: ConfirmFailure; message: string | null };

/**
 * The one place a reservation is created (ToDoRedesign §11).
 *
 * There is no server-side hold — the backend has no `HELD` state — so the POST
 * is the whole commitment, and this hook is what makes it survive an impatient
 * player and a hostile network: one request per confirm, no success until the
 * server says so, and a named failure the caller can offer a way out of.
 */
export function useConfirmBooking() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scope = queryScope();
  const createReservation = useCreateReservationMutation();

  // `isPending` only flips on the next render, which is one paint too late to
  // stop a double tap. This latch is checked synchronously, so the second call
  // never reaches the network.
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<ConfirmFailure | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  /**
   * `POST /api/reservations/` answers with a serializer that may omit the new
   * id. The list is the only other place the row exists, so re-read it and
   * match on what we sent.
   */
  async function resolveId(created: Reservation | null, body: CreateReservationBody) {
    if (created && Number.isFinite(created.id)) return created.id;
    try {
      const list = await queryClient.fetchQuery({
        queryKey: reservationKeys.list(scope),
        queryFn: reservationsApi.list,
        staleTime: 0,
      });
      const wanted = new Date(body.start_datetime).getTime();
      const match = list.find(
        (reservation) =>
          reservation.court === body.court &&
          new Date(reservation.start_datetime).getTime() === wanted,
      );
      return match?.id ?? null;
    } catch {
      // The booking exists either way; only the deep link to it is lost.
      return null;
    }
  }

  async function confirm(args: ConfirmArgs): Promise<ConfirmResult> {
    if (inFlight.current) return { ok: true };
    inFlight.current = true;
    setBusy(true);
    setFailure(null);
    setMessage(null);

    const body: CreateReservationBody = {
      court: args.courtId,
      start_datetime: args.start,
      end_datetime: args.end,
    };

    try {
      const created = await createReservation.mutateAsync({
        body,
        meta: { amt: args.price, date: args.date },
      });
      const id = await resolveId(created, body);
      forgetIntent();

      if (id === null) {
        // Without an id there is no confirmation URL to land on. Fall back to
        // the list, highlighted by start time, rather than inventing a route.
        toast(t('booked_toast'), 'ok');
        navigate('/reservations', {
          state: { highlight: { id: null, start: body.start_datetime } },
        });
        return { ok: true };
      }

      // `replace`, so Back from the confirmation goes to the club page rather
      // than onto a review screen whose CTA could fire a second booking.
      navigate(`/booking/confirmation/${id}`, {
        replace: true,
        state: { price: args.price, clubId: args.clubId ?? null },
      });
      return { ok: true };
    } catch (error) {
      const kind = classifyConfirmFailure(error);
      const detail = error instanceof Error ? error.message : null;
      setFailure(kind);
      setMessage(detail);
      return { ok: false, failure: kind, message: detail };
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return {
    confirm,
    pending: busy || createReservation.isPending,
    failure,
    /** Server text for `invalid`, where the reason is only known to the backend. */
    message,
    reset: () => {
      setFailure(null);
      setMessage(null);
    },
  };
}
