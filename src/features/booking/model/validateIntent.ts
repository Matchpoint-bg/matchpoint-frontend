import type { Slot } from '../../courts';
import type { BookingIntent } from './bookingIntent';
import { isSelectable, slotStatus } from './slotStatus';

export type IntentProblem = 'past' | 'missing' | 'taken' | 'repriced';

export interface IntentCheck {
  /** `null` when the intent is still exactly bookable as quoted. */
  problem: IntentProblem | null;
  /** Live total for the run, which is what a repriced intent must be re-quoted at. */
  price: number;
  /** Whether the player can still go ahead (a reprice is a warning, not a block). */
  bookable: boolean;
  /** The live slots the intent covers, empty unless the run was found intact. */
  run: Slot[];
}

/**
 * Re-checks an intent against freshly loaded availability (ToDoRedesign §10:
 * validate again before confirm; define what happens when the slot is taken or
 * has changed).
 *
 * The rules, most severe first: a run whose end has passed is dead; a run the
 * day no longer contains is dead; a run with any unavailable slot is taken; a
 * run that still exists but costs something else is bookable at the new price,
 * with the change surfaced rather than silently accepted.
 */
export function validateIntent(intent: BookingIntent, slots: Slot[], now: Date): IntentCheck {
  const start = new Date(intent.start).getTime();
  const end = new Date(intent.end).getTime();

  if (end <= now.getTime()) {
    return { problem: 'past', price: intent.price, bookable: false, run: [] };
  }

  const run = slots.filter((slot) => {
    const slotStart = new Date(slot.start).getTime();
    return slotStart >= start && new Date(slot.end).getTime() <= end;
  });
  const covered =
    run.length > 0 &&
    new Date(run[0]?.start ?? 0).getTime() === start &&
    new Date(run[run.length - 1]?.end ?? 0).getTime() === end;
  if (!covered) return { problem: 'missing', price: intent.price, bookable: false, run: [] };

  const price = run.reduce((sum, slot) => sum + slot.price, 0);
  if (run.some((slot) => !isSelectable(slotStatus(slot, now)))) {
    return { problem: 'taken', price, bookable: false, run };
  }
  // Money is compared in whole stotinki; float noise is not a price change.
  if (Math.round(price * 100) !== Math.round(intent.price * 100)) {
    return { problem: 'repriced', price, bookable: true, run };
  }
  return { problem: null, price, bookable: true, run };
}
