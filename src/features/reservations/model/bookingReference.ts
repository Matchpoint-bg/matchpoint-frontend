/**
 * The number a player quotes on the phone. Synthesised from the reservation id
 * because the API has no reference field yet (§15) — the day it grows one, this
 * is the only place that has to change.
 */
export function bookingReference(id: number): string {
  return `MP-${id}`;
}
