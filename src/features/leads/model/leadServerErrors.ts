import { ApiError } from '../../../shared/api/httpClient';
import type { LeadField, LeadServerFieldErrors } from './lead.types';

/** API field name -> form field. Anything absent becomes a form-level message. */
const FIELD_BY_API_NAME: Record<string, LeadField> = {
  club_name: 'clubName',
  city: 'city',
  contact_name: 'contactName',
  email: 'email',
  phone: 'phone',
  courts_count: 'courtsCount',
  website: 'website',
  message: 'message',
};

export interface LeadServerErrors {
  /** Errors that belong under a specific control. */
  fields: LeadServerFieldErrors;
  /** Everything else: non_field_errors, an unknown field, a 500, a dead network. */
  formMessage?: string;
}

/** DRF gives `["msg"]` far more often than `"msg"`, but tolerate both. */
function firstMessage(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstMessage(item);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Turns a failed submit into something the form can show in the right places.
 *
 * `httpClient` already flattens the Django envelope down to a single message
 * for the toast-based screens, but it discards the per-field `errors` map on
 * the way — which is the half §13 actually asks for. This reads the map off
 * `ApiError.body` and puts each message under the control that caused it.
 *
 * Unmapped keys are deliberately not dropped: a validation error the UI cannot
 * place is still shown, at form level, because silently swallowing it would
 * leave a rejected submit looking like nothing happened.
 */
export function leadServerErrors(error: unknown): LeadServerErrors {
  if (!(error instanceof ApiError)) {
    // A thrown Error from the demo adapter, or a network failure.
    const message = error instanceof Error ? error.message : undefined;
    return { fields: {}, ...(message ? { formMessage: message } : {}) };
  }

  const body = error.body;
  if (!body || typeof body !== 'object') return { fields: {}, formMessage: error.message };

  const envelope = body as Record<string, unknown>;
  const raw = envelope.errors ?? envelope;
  if (!raw || typeof raw !== 'object') return { fields: {}, formMessage: error.message };

  const fields: LeadServerFieldErrors = {};
  const unplaced: string[] = [];

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    // "status" is the literal string "error" on every envelope, never prose.
    if (key === 'status') continue;

    const field = FIELD_BY_API_NAME[key];
    const message = firstMessage(value);
    if (!message) continue;

    if (field) fields[field] = message;
    else unplaced.push(message);
  }

  const formMessage = unplaced[0] ?? (Object.keys(fields).length === 0 ? error.message : undefined);
  return { fields, ...(formMessage ? { formMessage } : {}) };
}
