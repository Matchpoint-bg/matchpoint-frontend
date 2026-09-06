import { useMutation } from '@tanstack/react-query';
import { leadsApi } from '../api/leads.api';
import type { CreateLeadBody } from './lead.types';

/**
 * Submitting a lead reads nothing back, so there is no list query and nothing
 * to invalidate — the mutation is here for `isPending`/`isError`, which is what
 * keeps the submit button honest about being in flight (and is the first of the
 * three duplicate-submission guards).
 */
export function useCreateLeadMutation() {
  return useMutation({
    mutationFn: (body: CreateLeadBody) => leadsApi.create(body),
    // A rejected inquiry is a dead end for the person filling the form, not
    // something a silent retry fixes; retrying would also risk a duplicate.
    retry: false,
  });
}
