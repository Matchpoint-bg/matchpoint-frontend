import type { Slot } from '../../courts';

/**
 * What the player has committed to, in one object (ToDoRedesign §10).
 *
 * Everything the review page, the auth detour and (in Phase 4) the confirm step
 * need, with no dependency on the component that produced it. `price` is the
 * quote shown at selection time — it is re-checked against live availability
 * before confirming rather than trusted.
 */
export interface BookingIntent {
  clubId: number;
  courtId: number;
  /** Local `YYYY-MM-DD`, the day whose availability the slots came from. */
  date: string;
  /** ISO datetimes: the start of the first slot and the end of the last. */
  start: string;
  end: string;
  minutes: number;
  price: number;
}

const KEY = 'mp.booking-intent';

/**
 * Persistence strategy (§10 asks for one, documented):
 *
 * The URL is canonical — the review page reads its intent from the query
 * string, so a refresh, a shared link or a Back navigation all rebuild the same
 * intent with no hidden state. `sessionStorage` is only a recovery copy, for
 * the one case the URL cannot survive: a full-page redirect to an external
 * identity provider and back. Nothing reads storage in preference to the URL,
 * so the two can never disagree.
 */
export function intentToParams(intent: BookingIntent): URLSearchParams {
  return new URLSearchParams({
    club: String(intent.clubId),
    court: String(intent.courtId),
    date: intent.date,
    start: intent.start,
    end: intent.end,
    minutes: String(intent.minutes),
    price: String(intent.price),
  });
}

export function intentFromParams(params: URLSearchParams): BookingIntent | null {
  const clubId = Number(params.get('club'));
  const courtId = Number(params.get('court'));
  const date = params.get('date') ?? '';
  const start = params.get('start') ?? '';
  const end = params.get('end') ?? '';
  const minutes = Number(params.get('minutes'));
  const price = Number(params.get('price'));

  const numbers = [clubId, courtId, minutes, price];
  if (numbers.some((value) => !Number.isFinite(value))) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (Number.isNaN(new Date(start).getTime()) || Number.isNaN(new Date(end).getTime())) return null;
  if (new Date(end).getTime() <= new Date(start).getTime()) return null;

  return { clubId, courtId, date, start, end, minutes, price };
}

export function intentPath(intent: BookingIntent): string {
  return `/book?${intentToParams(intent).toString()}`;
}

export function intentFromSelection(
  clubId: number,
  courtId: number,
  date: string,
  first: Slot,
  last: Slot,
  minutes: number,
  price: number,
): BookingIntent {
  return { clubId, courtId, date, start: first.start, end: last.end, minutes, price };
}

/** Recovery copy, for the external-auth round trip only. Best effort. */
export function rememberIntent(intent: BookingIntent): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(intent));
  } catch {
    // Private mode or a full quota — the URL still carries the intent.
  }
}

export function recallIntent(): BookingIntent | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return intentFromParams(intentToParams(JSON.parse(raw) as BookingIntent));
  } catch {
    return null;
  }
}

export function forgetIntent(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to do — a stale copy is only ever a fallback.
  }
}
