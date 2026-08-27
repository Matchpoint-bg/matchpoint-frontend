import { store } from './store';
import { DEMO, demoAvailability, demoReservations, saveDemoReservations } from './demo';
import type {
  Club,
  Court,
  CreateReservationBody,
  DemoReservation,
  DemoReservationMeta,
  Employee,
  OpeningHour,
  Price,
  RegisterPayload,
  Reservation,
  Slot,
  UpdateUserPayload,
  User,
} from '../types';

interface RequestOptions extends RequestInit {
  noAuth?: boolean;
  _retried?: boolean;
}

/**
 * Called when the session is definitively gone (refresh rejected). AuthContext registers a
 * handler at mount so the app can drop back to the sign-in screen instead of sitting in a
 * shell where every request 401s forever.
 */
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(fn: (() => void) | null): void {
  onSessionExpired = fn;
}

function errorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    // `message` comes before the generic fallback because this backend answers with
    // {"status":"error","message":"…"} — taking the first value would surface "error".
    const candidate =
      d.detail ??
      d.message ??
      (Array.isArray(d.non_field_errors) ? d.non_field_errors[0] : undefined) ??
      Object.values(d)[0];
    if (Array.isArray(candidate)) return String(candidate[0]);
    if (typeof candidate === 'string') return candidate;
  }
  return `Request failed (${status})`;
}

export const api = {
  url(p: string): string {
    return store.api.replace(/\/$/, '') + p;
  },

  async raw(path: string, opts: RequestOptions = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((opts.headers as Record<string, string>) || {}),
    };
    if (store.access && !opts.noAuth) headers['Authorization'] = `Bearer ${store.access}`;

    const res = await fetch(this.url(path), { ...opts, headers });

    // A 401 with no token at all is just a public page hitting a protected endpoint —
    // there is no session to refresh or expire, so leave the signed-out state alone.
    if (res.status === 401 && !opts.noAuth && !opts._retried && store.access) {
      const ok = store.refresh ? await this.refreshToken() : false;
      if (ok) return this.raw(path, { ...opts, _retried: true });
      // The session is unrecoverable: drop the dead tokens and tell the app, otherwise
      // `authed` stays true on the strength of a token the server no longer accepts.
      store.clearTokens();
      onSessionExpired?.();
    }
    return res;
  },

  async json<T>(path: string, opts?: RequestOptions): Promise<T> {
    const res = await this.raw(path, opts);
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      /* empty body */
    }
    if (!res.ok) throw new Error(errorMessage(data, res.status));
    return data as T;
  },

  async refreshToken(): Promise<boolean> {
    try {
      const r = await fetch(this.url('/api/v1/auth/token/refresh/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: store.refresh }),
      });
      if (!r.ok) return false;
      const d = (await r.json()) as { access?: string; refresh?: string };
      store.setTokens(d.access, d.refresh);
      return true;
    } catch {
      return false;
    }
  },

  /* ---- auth ---- */
  /** Current user from the server. Also the token-validity probe used on app boot. */
  async me(): Promise<User> {
    if (store.demo) {
      return (
        store.user ?? {
          email: 'demo@matchpoint.bg',
          first_name: 'Demo',
          last_name: 'Player',
          is_staff: store.staff,
        }
      );
    }
    // Two calls, because neither endpoint alone describes the user: dj-rest-auth's
    // /auth/user/ carries the pk but only email + names, while /api/users/{pk}/ carries
    // phone_number and preferred_language but no pk of its own.
    const base = await this.json<User>('/api/v1/auth/user/');
    if (base.pk === undefined) return base;
    try {
      const details = await this.json<User>(`/api/users/${base.pk}/`);
      return { ...base, ...details, pk: base.pk };
    } catch {
      return base;
    }
  },

  async login(email: string, password: string): Promise<void> {
    if (store.demo) {
      store.setTokens('demo-access', 'demo-refresh');
      store.user = {
        email,
        first_name: 'Demo',
        last_name: 'Player',
        phone_number: '',
        preferred_language: store.lang === 'bg' ? 'Български' : 'English',
        is_staff: store.staff,
      };
      return;
    }
    const d = await this.json<{ access: string; refresh: string }>('/api/v1/auth/login/', {
      method: 'POST',
      noAuth: true,
      body: JSON.stringify({ email, password }),
    });
    store.setTokens(d.access, d.refresh);
    try {
      store.user = await this.me();
    } catch {
      store.user = { email };
    }
  },

  async updateUser(payload: UpdateUserPayload): Promise<User> {
    if (store.demo) {
      const next = { ...(store.user ?? { email: 'demo@matchpoint.bg' }), ...payload };
      store.user = next;
      return next;
    }
    // PATCH /api/v1/auth/user/ silently drops phone_number — its serializer only knows
    // email and names. /api/users/{pk}/ is the one that can actually store it.
    const pk = store.user?.pk ?? (await this.me()).pk;
    if (pk === undefined) throw new Error('Cannot resolve the current user');
    const details = await this.json<User>(`/api/users/${pk}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    const u = { ...(store.user ?? {}), ...details, pk };
    store.user = u;
    return u;
  },

  async changePassword(newPassword: string, confirm: string): Promise<void> {
    if (store.demo) return;
    await this.json('/api/v1/auth/password/change/', {
      method: 'POST',
      body: JSON.stringify({ new_password1: newPassword, new_password2: confirm }),
    });
  },

  async requestPasswordReset(email: string): Promise<void> {
    if (store.demo) return;
    await this.json('/api/v1/auth/password/reset/', {
      method: 'POST',
      noAuth: true,
      body: JSON.stringify({ email }),
    });
  },

  async confirmPasswordReset(
    uid: string,
    token: string,
    newPassword: string,
    confirm: string,
  ): Promise<void> {
    if (store.demo) return;
    await this.json('/api/v1/auth/password/reset/confirm/', {
      method: 'POST',
      noAuth: true,
      body: JSON.stringify({
        uid,
        token,
        new_password1: newPassword,
        new_password2: confirm,
      }),
    });
  },

  async register(payload: RegisterPayload): Promise<void> {
    if (store.demo) {
      store.setTokens('demo-access', 'demo-refresh');
      store.user = {
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone_number: payload.phone_number || '',
        preferred_language: store.lang === 'bg' ? 'Български' : 'English',
        is_staff: store.staff,
      };
      return;
    }
    // Trailing slash matters: Django's APPEND_SLASH redirect does not preserve a POST body.
    await this.json('/api/v1/auth/registration/', {
      method: 'POST',
      noAuth: true,
      body: JSON.stringify({
        email: payload.email,
        password1: payload.password,
        password2: payload.password,
        first_name: payload.first_name,
        last_name: payload.last_name,
      }),
    });
    await this.login(payload.email, payload.password);
  },

  googleUrl(): string {
    return this.url('/api/v1/auth/google/');
  },

  /* ---- clubs ---- */
  async clubs(): Promise<Club[]> {
    return store.demo ? DEMO.clubs : this.json<Club[]>('/api/clubs/');
  },
  async club(id: number): Promise<Club | undefined> {
    return store.demo ? DEMO.clubs.find((c) => c.id === id) : this.json<Club>(`/api/clubs/${id}/`);
  },
  async clubCourts(id: number): Promise<Court[]> {
    return store.demo
      ? DEMO.courts.filter((c) => c.club_id === id)
      : this.json<Court[]>(`/api/clubs/${id}/courts/`);
  },
  async clubOpeningHours(id: number): Promise<OpeningHour[]> {
    return store.demo
      ? // Synthetic pk so the hours editor can treat demo and real rows identically.
        (DEMO.openingHours[id] || []).map((r, i) => ({
          pk: i + 1,
          weekday: r[0],
          opening_hour: r[1],
          closing_hour: r[2],
        }))
      : this.json<OpeningHour[]>(`/api/clubs/${id}/opening-hours/`);
  },
  async addOpeningHour(id: number, body: OpeningHour): Promise<void> {
    if (store.demo) {
      const list = (DEMO.openingHours[id] = DEMO.openingHours[id] || []);
      list.push([body.weekday, body.opening_hour, body.closing_hour]);
      return;
    }
    await this.json(`/api/clubs/${id}/opening-hours/`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  /**
   * Opening-hours rows are edited by their own pk, not through the club. Note the
   * collection has no list route (`GET /api/openinghours/` 404s) — only detail
   * PATCH/DELETE — so reads always go through `clubOpeningHours` above.
   */
  async updateOpeningHour(pk: number, body: OpeningHour): Promise<void> {
    if (store.demo) {
      for (const list of Object.values(DEMO.openingHours)) {
        const row = list?.find((r) => r[0] === body.weekday);
        if (row) {
          row[1] = body.opening_hour;
          row[2] = body.closing_hour;
        }
      }
      return;
    }
    await this.json(`/api/openinghours/${pk}/`, {
      method: 'PATCH',
      body: JSON.stringify({
        weekday: body.weekday,
        opening_hour: body.opening_hour,
        closing_hour: body.closing_hour,
      }),
    });
  },

  async deleteOpeningHour(pk: number, clubId: number, weekday: string): Promise<void> {
    if (store.demo) {
      const list = DEMO.openingHours[clubId];
      const i = list?.findIndex((r) => r[0] === weekday) ?? -1;
      if (list && i > -1) list.splice(i, 1);
      return;
    }
    await this.json(`/api/openinghours/${pk}/`, { method: 'DELETE' });
  },

  async clubEmployees(id: number): Promise<Employee[]> {
    return store.demo
      ? DEMO.employees[id] || []
      : this.json<Employee[]>(`/api/clubs/${id}/employees/`);
  },
  async updateClub(id: number, body: Partial<Club>): Promise<void> {
    if (store.demo) {
      const c = DEMO.clubs.find((x) => x.id === id);
      if (c) Object.assign(c, body);
      return;
    }
    await this.json(`/api/clubs/${id}/`, { method: 'PATCH', body: JSON.stringify(body) });
  },

  /* ---- courts ---- */
  async court(id: number): Promise<Court | undefined> {
    return store.demo ? DEMO.courts.find((c) => c.id === id) : this.json<Court>(`/api/courts/${id}/`);
  },
  async availability(id: number, date: string): Promise<Slot[]> {
    return store.demo
      ? demoAvailability(id, date)
      : this.json<Slot[]>(`/api/courts/${id}/availabilities/?date=${date}`);
  },
  async prices(id: number): Promise<Price[]> {
    if (store.demo) {
      const c = DEMO.courts.find((x) => x.id === id);
      const base = c?.is_indoor ? 9 : 7;
      return [
        { weekday: 'All', time_start: '08:00', time_end: '18:00', price_per_30_minutes: base },
        { weekday: 'All', time_start: '18:00', time_end: '22:00', price_per_30_minutes: base + 4 },
      ];
    }
    return this.json<Price[]>(`/api/courts/${id}/prices/`);
  },
  async setPrices(id: number, arr: Price[]): Promise<void> {
    if (store.demo) return;
    await this.json(`/api/courts/${id}/prices/`, { method: 'PUT', body: JSON.stringify(arr) });
  },
  async unavailabilities(id: number): Promise<{ start_datetime: string; end_datetime: string }[]> {
    if (store.demo) return [];
    return this.json(`/api/courts/${id}/unavailabilities/`);
  },
  async addUnavailability(
    id: number,
    body: { start_datetime: string; end_datetime: string },
  ): Promise<void> {
    if (store.demo) return;
    await this.json(`/api/courts/${id}/unavailabilities/`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  async createCourt(body: Partial<Court>): Promise<{ id: number }> {
    if (store.demo) {
      const id = Math.max(...DEMO.courts.map((c) => c.id)) + 1;
      DEMO.courts.push({ ...(body as Court), id });
      return { id };
    }
    return this.json<{ id: number }>('/api/courts/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  async updateCourt(id: number, body: Partial<Court>): Promise<void> {
    if (store.demo) {
      const c = DEMO.courts.find((x) => x.id === id);
      if (c) Object.assign(c, body);
      return;
    }
    await this.json(`/api/courts/${id}/`, { method: 'PATCH', body: JSON.stringify(body) });
  },
  async deleteCourt(id: number): Promise<void> {
    if (store.demo) {
      const i = DEMO.courts.findIndex((c) => c.id === id);
      if (i > -1) DEMO.courts.splice(i, 1);
      return;
    }
    await this.json(`/api/courts/${id}/`, { method: 'DELETE' });
  },

  /* ---- reservations ---- */
  async reservations(): Promise<Reservation[]> {
    if (store.demo) {
      return demoReservations().map((r) => ({
        id: r.id,
        court: r.court,
        start_datetime: r.start,
        end_datetime: r.end,
        reservation_amt: r.amt,
      }));
    }
    return this.json<Reservation[]>('/api/reservations/');
  },

  async createReservation(
    body: CreateReservationBody,
    meta?: DemoReservationMeta,
  ): Promise<Reservation | null> {
    if (store.demo) {
      const arr = demoReservations();
      const start = new Date(body.start_datetime);
      const end = new Date(body.end_datetime);
      const slots: string[] = [];
      for (let t = new Date(start); t < end; t = new Date(t.getTime() + 30 * 60000)) {
        slots.push(
          `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`,
        );
      }
      const rec: DemoReservation = {
        id: Date.now(),
        court: Number(body.court),
        start: body.start_datetime,
        end: body.end_datetime,
        amt: meta?.amt ?? 0,
        date: meta?.date ?? '',
        slots,
      };
      arr.push(rec);
      saveDemoReservations(arr);
      return {
        id: rec.id,
        court: rec.court,
        start_datetime: rec.start,
        end_datetime: rec.end,
        reservation_amt: rec.amt,
      };
    }
    return this.json<Reservation>('/api/reservations/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /** Reschedule: moves an existing booking to a new court/time. */
  async updateReservation(id: number, body: CreateReservationBody): Promise<void> {
    if (store.demo) {
      const a = demoReservations();
      const r = a.find((x) => x.id === id);
      if (r) {
        Object.assign(r, {
          court: Number(body.court),
          start: body.start_datetime,
          end: body.end_datetime,
        });
      }
      saveDemoReservations(a);
      return;
    }
    await this.json(`/api/reservations/${id}/`, { method: 'PATCH', body: JSON.stringify(body) });
  },

  async deleteReservation(id: number): Promise<void> {
    if (store.demo) {
      saveDemoReservations(demoReservations().filter((r) => r.id !== id));
      return;
    }
    await this.json(`/api/reservations/${id}/`, { method: 'DELETE' });
  },
};
