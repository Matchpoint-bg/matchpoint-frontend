import { isEmail, isPhone, isUrlLike, normalizeUrl } from '../../../shared/lib/validation';
import type { CreateLeadBody, LeadDraft, LeadErrors } from './lead.types';

export const EMPTY_LEAD_DRAFT: LeadDraft = {
  clubName: '',
  city: '',
  contactName: '',
  email: '',
  phone: '',
  courtsCount: '',
  website: '',
  message: '',
  company: '',
};

export const MAX_CLUB_NAME = 120;
export const MAX_CITY = 80;
export const MAX_CONTACT_NAME = 120;
export const MAX_MESSAGE = 1000;
export const MIN_COURTS = 1;
export const MAX_COURTS = 60;

/**
 * Everything a form submit checks, in one pure function.
 *
 * City is free text rather than the `SEARCH_CITIES` select: player search only
 * covers Sofia today, but a club in Plovdiv writing in is exactly the lead we
 * want, and a dropdown with one option would turn them away.
 */
export function validateLeadDraft(draft: LeadDraft): LeadErrors {
  const errors: LeadErrors = {};

  if (!draft.clubName.trim()) errors.clubName = 'required';
  else if (draft.clubName.trim().length > MAX_CLUB_NAME) errors.clubName = 'too_long';

  if (!draft.city.trim()) errors.city = 'required';
  else if (draft.city.trim().length > MAX_CITY) errors.city = 'too_long';

  if (!draft.contactName.trim()) errors.contactName = 'required';
  else if (draft.contactName.trim().length > MAX_CONTACT_NAME) errors.contactName = 'too_long';

  if (!draft.email.trim()) errors.email = 'required';
  else if (!isEmail(draft.email)) errors.email = 'invalid';

  if (!draft.phone.trim()) errors.phone = 'required';
  else if (!isPhone(draft.phone)) errors.phone = 'invalid';

  const courts = draft.courtsCount.trim();
  if (!courts) errors.courtsCount = 'required';
  else if (!/^\d+$/.test(courts)) errors.courtsCount = 'invalid';
  else if (Number(courts) < MIN_COURTS || Number(courts) > MAX_COURTS) errors.courtsCount = 'range';

  // Optional fields are only checked when they hold something.
  if (draft.website.trim() && !isUrlLike(draft.website)) errors.website = 'invalid';
  if (draft.message.trim().length > MAX_MESSAGE) errors.message = 'too_long';

  return errors;
}

/**
 * Draft -> POST body. Trims everything, drops empty optionals rather than
 * sending `""` (the codebase's `...(x ? { x } : {})` spread, which also keeps
 * the optional properties honest under the compiler's strict optional rules).
 */
export function leadBodyFromDraft(draft: LeadDraft, clientToken: string): CreateLeadBody {
  const website = normalizeUrl(draft.website);
  const message = draft.message.trim();

  return {
    club_name: draft.clubName.trim(),
    city: draft.city.trim(),
    contact_name: draft.contactName.trim(),
    email: draft.email.trim(),
    phone: draft.phone.trim(),
    courts_count: Number(draft.courtsCount.trim()),
    ...(website ? { website } : {}),
    ...(message ? { message } : {}),
    client_token: clientToken,
  };
}

/**
 * Identity of a submission, for the "already sent this" guard.
 *
 * Built from the trimmed body rather than the raw draft so that adding a
 * trailing space and pressing send again is recognised as the same inquiry.
 */
export function leadFingerprint(draft: LeadDraft): string {
  const body = leadBodyFromDraft(draft, '');
  return JSON.stringify(body);
}
