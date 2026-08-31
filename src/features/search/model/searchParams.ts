import type {
  SearchCriteria,
  SearchDraft,
  SearchErrors,
  SearchUrlState,
} from './search.types';

export const DEFAULT_CITY = 'sofia';
export const DEFAULT_SPORT = 'tennis';
export const SEARCH_CITIES = [DEFAULT_CITY] as const;
export const SEARCH_SPORTS = [DEFAULT_SPORT] as const;
export const SEARCH_SURFACES = ['Clay', 'Grass', 'Hard'] as const;

const SEARCH_KEYS = ['city', 'sport', 'date', 'surface', 'time'] as const;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):(?:00|30)$/;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayValue(): string {
  return toDateInputValue(new Date());
}

export function tomorrowValue(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
}

export function weekendValue(): string {
  const date = new Date();
  const day = date.getDay();
  const daysUntilWeekend = day === 0 || day === 6 ? 0 : 6 - day;
  date.setDate(date.getDate() + daysUntilWeekend);
  return toDateInputValue(date);
}

function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const [yearString = '', monthString = '', dayString = ''] = value.split('-');
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function validateSearchDraft(draft: SearchDraft): SearchErrors {
  const errors: SearchErrors = {};

  if (!draft.city) errors.city = 'required';
  else if (!SEARCH_CITIES.includes(draft.city as (typeof SEARCH_CITIES)[number])) {
    errors.city = 'unsupported';
  }

  if (!draft.sport) errors.sport = 'required';
  else if (!SEARCH_SPORTS.includes(draft.sport as (typeof SEARCH_SPORTS)[number])) {
    errors.sport = 'unsupported';
  }

  if (!draft.date) errors.date = 'required';
  else if (!isRealDate(draft.date)) errors.date = 'invalid';
  else if (draft.date < todayValue()) errors.date = 'past';

  if (draft.surface && !SEARCH_SURFACES.includes(draft.surface as (typeof SEARCH_SURFACES)[number])) {
    errors.surface = 'unsupported';
  }

  if (draft.time && !TIME_PATTERN.test(draft.time)) errors.time = 'invalid';

  return errors;
}

export function parseSearchParams(params: URLSearchParams): SearchUrlState {
  const hasSearchIntent = SEARCH_KEYS.some((key) => params.has(key));
  if (!hasSearchIntent) return { status: 'idle', criteria: null, errors: {} };

  const draft: SearchDraft = {
    city: params.get('city')?.trim().toLowerCase() ?? '',
    sport: params.get('sport')?.trim().toLowerCase() ?? '',
    date: params.get('date')?.trim() ?? '',
    surface: params.get('surface')?.trim() ?? '',
    time: params.get('time')?.trim() ?? '',
  };
  const errors = validateSearchDraft(draft);
  if (Object.keys(errors).length > 0) {
    return { status: 'invalid', criteria: null, errors };
  }

  return {
    status: 'valid',
    criteria: {
      city: draft.city,
      sport: draft.sport,
      date: draft.date,
      ...(draft.surface ? { surface: draft.surface } : {}),
      ...(draft.time ? { time: draft.time } : {}),
    },
    errors: {},
  };
}

export function draftFromSearchParams(params: URLSearchParams): SearchDraft {
  const raw: SearchDraft = {
    city: params.get('city')?.trim().toLowerCase() ?? DEFAULT_CITY,
    sport: params.get('sport')?.trim().toLowerCase() ?? DEFAULT_SPORT,
    date: params.get('date')?.trim() ?? todayValue(),
    surface: params.get('surface')?.trim() ?? '',
    time: params.get('time')?.trim() ?? '',
  };

  return {
    city: SEARCH_CITIES.includes(raw.city as (typeof SEARCH_CITIES)[number])
      ? raw.city
      : DEFAULT_CITY,
    sport: SEARCH_SPORTS.includes(raw.sport as (typeof SEARCH_SPORTS)[number])
      ? raw.sport
      : DEFAULT_SPORT,
    date: isRealDate(raw.date) && raw.date >= todayValue() ? raw.date : todayValue(),
    surface: !raw.surface || SEARCH_SURFACES.includes(raw.surface as (typeof SEARCH_SURFACES)[number])
      ? raw.surface
      : '',
    time: !raw.time || TIME_PATTERN.test(raw.time) ? raw.time : '',
  };
}

export function searchCriteriaParams(criteria: SearchCriteria): URLSearchParams {
  const params = new URLSearchParams({
    city: criteria.city,
    sport: criteria.sport,
    date: criteria.date,
  });
  if (criteria.surface) params.set('surface', criteria.surface);
  if (criteria.time) params.set('time', criteria.time);
  return params;
}
