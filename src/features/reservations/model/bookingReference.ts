/**
 * The number a player quotes at the desk (ToDoRedesign §11).
 *
 * The API has no reference field yet — that is a §15 backlog item — so this
 * formats the reservation id into something readable and quotable. When the
 * backend starts sending a real reference, this becomes its formatter and the
 * pages calling it do not change.
 *
 * The id is padded, never truncated: a reference that cannot be traced back to
 * the row it names is worse than a long one.
 */
export function bookingReference(id: number): string {
  return `MP-${String(id).padStart(6, '0')}`;
}
