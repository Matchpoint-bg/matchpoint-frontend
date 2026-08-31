import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  draftFromSearchParams,
  parseSearchParams,
  searchCriteriaParams,
  validateSearchDraft,
} from './searchParams';
import type { SearchDraft, SearchErrors, SearchField } from './search.types';

export function usePlayerSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = useMemo(() => parseSearchParams(searchParams), [searchParams]);
  const [draft, setDraft] = useState<SearchDraft>(() => draftFromSearchParams(searchParams));
  const [formErrors, setFormErrors] = useState<SearchErrors>({});

  useEffect(() => {
    setDraft(draftFromSearchParams(searchParams));
    setFormErrors({});
  }, [searchParams]);

  const setField = useCallback((field: SearchField, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const submit = useCallback(() => {
    const errors = validateSearchDraft(draft);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return false;

    setSearchParams(
      searchCriteriaParams({
        city: draft.city,
        sport: draft.sport,
        date: draft.date,
      }),
    );
    return true;
  }, [draft, setSearchParams]);

  return {
    draft,
    setField,
    submit,
    formErrors,
    urlState,
  };
}
