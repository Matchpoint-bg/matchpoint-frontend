export interface SearchCriteria {
  city: string;
  sport: string;
  date: string;
  surface?: string;
  time?: string;
}

export interface SearchDraft {
  city: string;
  sport: string;
  date: string;
  surface: string;
  time: string;
}

export type SearchField = keyof SearchDraft;
export type SearchErrors = Partial<Record<SearchField, 'required' | 'unsupported' | 'past' | 'invalid'>>;

export type SearchUrlState =
  | { status: 'idle'; criteria: null; errors: SearchErrors }
  | { status: 'invalid'; criteria: null; errors: SearchErrors }
  | { status: 'valid'; criteria: SearchCriteria; errors: SearchErrors };
