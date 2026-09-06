/** The nine inputs a club fills in, all held as strings while being edited. */
export interface LeadDraft {
  clubName: string;
  city: string;
  contactName: string;
  email: string;
  phone: string;
  courtsCount: string;
  website: string;
  message: string;
  /** Honeypot. Always empty for a person — it is hidden from them. */
  company: string;
}

export type LeadField = keyof LeadDraft;

/**
 * Validation results are codes, not prose, so the model layer stays free of
 * i18n and the form decides how to word each one — the same split
 * `validateSearchDraft` uses (src/features/search/model/searchParams.ts).
 */
export type LeadErrorCode = 'required' | 'invalid' | 'too_long' | 'range';

export type LeadErrors = Partial<Record<LeadField, LeadErrorCode>>;

/** Server-worded messages, which cannot be codes — the server writes them. */
export type LeadServerFieldErrors = Partial<Record<LeadField, string>>;

/** The POST body. snake_case, matching the API's other endpoints. */
export interface CreateLeadBody {
  club_name: string;
  city: string;
  contact_name: string;
  email: string;
  phone: string;
  courts_count: number;
  website?: string;
  message?: string;
  /**
   * Stable per form instance, so a retry that the network duplicated resolves
   * to one lead rather than two. Ignored harmlessly by a server that does not
   * implement it yet.
   */
  client_token: string;
}

export interface Lead {
  id: number;
  /** Short human-quotable code, shown on the success panel. */
  reference: string;
  status: string;
  created_at: string;
}

/** A lead as demo mode stores it: the server's answer plus what was sent. */
export interface DemoLead extends Lead {
  client_token: string;
  body: CreateLeadBody;
}
