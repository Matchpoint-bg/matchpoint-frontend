import { demoLeads, saveDemoLeads } from '../../../demo/demoData';
import { ApiError, httpClient } from '../../../shared/api/httpClient';
import { store } from '../../../shared/storage/store';
import type { CreateLeadBody, Lead } from '../model/lead.types';

/** MP-7K2F9 — short enough to read down the phone, long enough not to collide. */
function demoReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `MP-${code}`;
}

export const leadsApi = {
  /**
   * Sends a club inquiry.
   *
   * The endpoint does not exist in matchpoint-api yet (§13 "Backend
   * dependency", §15) — the path and body here are the contract documented in
   * the README, so the day it lands this flips over with no UI change. Until
   * then only the demo branch actually completes, which is why demo mode is
   * how this screen is verified.
   */
  create: async (body: CreateLeadBody): Promise<Lead> => {
    if (store.demo) {
      const leads = demoLeads();

      // The server is expected to dedupe on client_token; do it here too, so
      // the duplicate path can be exercised without a backend.
      const existing = leads.find((lead) => lead.client_token === body.client_token);
      if (existing) {
        throw new ApiError('This inquiry was already sent.', 409, {
          status: 'error',
          errors: { non_field_errors: ['This inquiry was already sent.'] },
        });
      }

      const lead: Lead & { client_token: string } = {
        id: Date.now(),
        reference: demoReference(),
        status: 'new',
        created_at: new Date().toISOString(),
        client_token: body.client_token,
      };
      saveDemoLeads([...leads, { ...lead, body }]);
      return lead;
    }

    return httpClient.json<Lead>('/api/v1/leads/', {
      method: 'POST',
      // Public endpoint: a club owner sending an inquiry is not signed in, and
      // attaching a stale token would only give the server a reason to 401.
      noAuth: true,
      body: JSON.stringify(body),
    });
  },
};
