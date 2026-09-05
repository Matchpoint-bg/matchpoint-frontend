import { store } from '../storage/store';

interface RequestOptions extends RequestInit {
  noAuth?: boolean;
  retried?: boolean;
}

let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

export function apiUrl(path: string): string {
  return store.api.replace(/\/$/, '') + path;
}

/**
 * A failed response, with the status kept alongside the message.
 *
 * Callers that only ever showed `error.message` are unaffected — this is still
 * an `Error`. It exists so a caller can tell a booking conflict from a server
 * error from a dropped connection (ToDoRedesign §11) instead of guessing from
 * translated prose.
 */
export class ApiError extends Error {
  readonly status: number;
  /** The parsed response body, when there was one. */
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/** The first human-readable string anywhere in a nested DRF error payload. */
function firstString(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstString(item);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      const found = firstString(item);
      if (found) return found;
    }
  }
  return null;
}

/**
 * MatchPoint's `custom_exception_handler` wraps every failure in an envelope:
 * `{status: "error", message}` for APIExceptions and `{status: "error", errors: {...}}`
 * for validation errors, where `errors` is DRF's usual field -> [message] map.
 *
 * `status` is the literal string "error" on all of them, so it must never be read
 * as prose — picking the first value off the object would show the user "error".
 */
function errorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const candidate =
      record.detail ??
      record.message ??
      record.errors ??
      record.non_field_errors ??
      Object.fromEntries(Object.entries(record).filter(([key]) => key !== 'status'));
    const message = firstString(candidate);
    if (message) return message;
  }
  return `Request failed (${status})`;
}

async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch(apiUrl('/api/v1/auth/token/refresh/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: store.refresh }),
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { access?: string; refresh?: string };
    store.setTokens(data.access, data.refresh);
    return true;
  } catch {
    return false;
  }
}

async function raw(path: string, options: RequestOptions = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  // A multipart body carries its own boundary, which only the browser can generate.
  // Sending our JSON default instead leaves the server with no boundary to split on,
  // so every image upload would arrive as an empty form.
  if (options.body instanceof FormData) delete headers['Content-Type'];
  if (store.access && !options.noAuth) headers.Authorization = `Bearer ${store.access}`;

  const response = await fetch(apiUrl(path), { ...options, headers });
  if (response.status === 401 && !options.noAuth && !options.retried && store.access) {
    const refreshed = store.refresh ? await refreshToken() : false;
    if (refreshed) return raw(path, { ...options, retried: true });
    store.clearTokens();
    onSessionExpired?.();
  }
  return response;
}

async function json<T>(path: string, options?: RequestOptions): Promise<T> {
  const response = await raw(path, options);
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // Some successful DELETE endpoints return an empty body.
  }
  if (!response.ok) throw new ApiError(errorMessage(data, response.status), response.status, data);
  return data as T;
}

export const httpClient = { raw, json };
