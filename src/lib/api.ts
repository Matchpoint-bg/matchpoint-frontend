import { store } from './store';
import { DEMO, demoAvailability, demoReservations, saveDemoReservations } from './demo';
import type {
  Club,
  Court,
  CreateReservationBody,
  DemoReservation,
  Employee,
  OpeningHour,
  Price,
  RegisterPayload,
  Reservation,
  Slot,
  User,
} from '../types';

interface RequestOptions extends RequestInit {
  noAuth?: boolean;
  _retried?: boolean;
}

function errorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const candidate =
      d.detail ??
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

    if (res.status === 401 && store.refresh && !opts._retried) {
      const ok = await this.refreshToken();
      if (ok) return this.raw(path, { ...opts, _retried: true });
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
      const r = await fetch(this.url('/api/token/refresh/'), {
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
  async login(email: string, password: string): Promise<void> {
    if (store.demo) {
      store.setTokens('demo-access', 'demo-refresh');
      store.user = {
        email,
        first_name: 'Demo',
        last_name: 'Player',
        phone_number: '',
        preferred_language: store.lang === 'bg' ? 'Български' : 'English',
      };
      return;
    }
    const d = await this.json<{ access: string; refresh: string }>('/api/token/', {
      method: 'POST',
      noAuth: true,
      body: JSON.stringify({ email, password }),
    });
    store.setTokens(d.access, d.refresh);
    try {
      store.user = await this.json<User>('/api/v1/auth/user/');
    } catch {
      store.user = { email };
    }
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
      };
      return;
    }
    await this.json('/api/v1/auth/registration', {
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
      ? (DEMO.openingHours[id] || []).map((r) => ({
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
    await this.raw(`/api/courts/${id}/prices/`, { method: 'PUT', body: JSON.stringify(arr) });
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
    await this.raw(`/api/courts/${id}/unavailabilities/`, {
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
    await this.raw(`/api/courts/${id}/`, { method: 'DELETE' });
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

  async createReservation(body: CreateReservationBody): Promise<void> {
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
        amt: body._amt || 0,
        date: body._date || '',
        slots,
      };
      arr.push(rec);
      saveDemoReservations(arr);
      return;
    }
    await this.json('/api/reservations/', {
      method: 'POST',
      body: JSON.stringify({
        court: body.court,
        start_datetime: body.start_datetime,
        end_datetime: body.end_datetime,
      }),
    });
  },

  /** Reschedule path. Exposed for completeness; no screen calls it yet. */
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
    await this.raw(`/api/reservations/${id}/`, { method: 'DELETE' });
  },
};
