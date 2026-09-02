import { ApiError } from '../../../shared/api/httpClient';

/**
 * Why a confirm did not become a reservation (ToDoRedesign §11).
 *
 * Four outcomes, because the player needs four different ways out: someone else
 * took the slot, the session died while they were reading, the server refused
 * the request, or it never arrived.
 */
export type ConfirmFailure = 'conflict' | 'auth' | 'invalid' | 'network';

/**
 * The backend has no explicit conflict status yet (§15), so a taken slot comes
 * back as a plain 400 with a message about the overlap. These are the words it
 * uses; a real 409 needs none of them.
 */
const CONFLICT_WORDS =
  /(overlap|conflict|already\s+(booked|reserved|taken)|not\s+available|unavailable|taken|зает|заета|застъп)/i;

export function classifyConfirmFailure(error: unknown): ConfirmFailure {
  if (!(error instanceof ApiError)) return 'network';
  if (error.status === 409) return 'conflict';
  if (error.status === 401 || error.status === 403) return 'auth';
  if (error.status === 400 && CONFLICT_WORDS.test(error.message)) return 'conflict';
  if (error.status >= 400 && error.status < 500) return 'invalid';
  // 5xx is not the player's problem to fix, and retrying is the only move they
  // have — the same one a dropped connection gets.
  return 'network';
}
