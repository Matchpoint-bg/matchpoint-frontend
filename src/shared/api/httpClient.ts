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

function errorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const candidate =
      record.detail ??
      record.message ??
      (Array.isArray(record.non_field_errors) ? record.non_field_errors[0] : undefined) ??
      Object.values(record)[0];
    if (Array.isArray(candidate)) return String(candidate[0]);
    if (typeof candidate === 'string') return candidate;
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
  if (!response.ok) throw new Error(errorMessage(data, response.status));
  return data as T;
}

export const httpClient = { raw, json };
