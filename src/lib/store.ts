import type { User } from '../types';

export const LS = {
  api: 'mp_api',
  access: 'mp_access',
  refresh: 'mp_refresh',
  user: 'mp_user',
  demo: 'mp_demo',
  staff: 'mp_staff',
  demoRes: 'mp_demo_res',
  dismissInstall: 'mp_no_install',
  theme: 'mp_theme',
  lang: 'mp_lang',
  staffClub: 'mp_staff_club',
  notifyConfirm: 'mp_notify_confirm',
  notifyRemind: 'mp_notify_remind',
  notifyCancel: 'mp_notify_cancel',
} as const;

export type NotifyKey = 'notifyConfirm' | 'notifyRemind' | 'notifyCancel';

export type Theme = 'light' | 'dark';
export type Lang = 'en' | 'bg';

/**
 * localStorage-backed settings. Kept as a plain module (not React state) so the
 * API client can read tokens and the demo flag without being threaded through props.
 * React surfaces that need to re-render on change wrap these in context providers.
 */
export const store = {
  /**
   * API base, baked in at build time via VITE_API_URL. An empty value means "same origin",
   * which is what the Docker image uses (nginx proxies /api/). The localStorage override is
   * honoured in dev only: in production the Settings field is hidden, and trusting a stored
   * URL there would mean sending the Bearer token to whatever host was last typed in.
   */
  get api(): string {
    if (import.meta.env.DEV) {
      const override = localStorage.getItem(LS.api);
      if (override) return override;
      return import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
    }
    // Production falls back to the same origin, never to a developer's localhost: an
    // unconfigured build should look for /api/ behind its own nginx, not a machine that
    // isn't there.
    return import.meta.env.VITE_API_URL ?? '';
  },
  set api(v: string) {
    localStorage.setItem(LS.api, v);
  },

  get access(): string | null {
    return localStorage.getItem(LS.access);
  },
  get refresh(): string | null {
    return localStorage.getItem(LS.refresh);
  },
  setTokens(a?: string, r?: string) {
    if (a) localStorage.setItem(LS.access, a);
    if (r) localStorage.setItem(LS.refresh, r);
  },
  clearTokens() {
    [LS.access, LS.refresh, LS.user].forEach((k) => localStorage.removeItem(k));
  },

  get user(): User | null {
    try {
      return JSON.parse(localStorage.getItem(LS.user) || 'null') as User | null;
    } catch {
      return null;
    }
  },
  set user(u: User | null) {
    localStorage.setItem(LS.user, JSON.stringify(u));
  },

  /**
   * Demo mode serves fixtures instead of the API. Off unless VITE_DEMO=1 (set in
   * .env.development), and toggleable at runtime in dev only — a production build must never
   * show fake clubs or accept a fake login.
   */
  get demo(): boolean {
    if (!import.meta.env.DEV) return false;
    const override = localStorage.getItem(LS.demo);
    if (override !== null) return override === '1';
    return import.meta.env.VITE_DEMO === '1';
  },
  set demo(v: boolean) {
    localStorage.setItem(LS.demo, v ? '1' : '0');
  },

  get staff(): boolean {
    return localStorage.getItem(LS.staff) === '1';
  },
  set staff(v: boolean) {
    localStorage.setItem(LS.staff, v ? '1' : '0');
  },

  get theme(): Theme {
    return localStorage.getItem(LS.theme) === 'dark' ? 'dark' : 'light';
  },
  set theme(v: Theme) {
    localStorage.setItem(LS.theme, v);
  },

  get lang(): Lang {
    return localStorage.getItem(LS.lang) === 'bg' ? 'bg' : 'en';
  },
  set lang(v: Lang) {
    localStorage.setItem(LS.lang, v);
  },

  /** Which club the staff tab is currently managing. No API tells us, so the user picks. */
  get staffClub(): number | null {
    const raw = localStorage.getItem(LS.staffClub);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : null;
  },
  set staffClub(v: number | null) {
    if (v === null) localStorage.removeItem(LS.staffClub);
    else localStorage.setItem(LS.staffClub, String(v));
  },

  /**
   * Notification preferences. Device-local and inert: the backend has no notification
   * model or delivery mechanism, so nothing reads these but the settings screen itself.
   * Default on, so enabling delivery later matches what the user was already shown.
   */
  notify(key: NotifyKey): boolean {
    return localStorage.getItem(LS[key]) !== '0';
  },
  setNotify(key: NotifyKey, v: boolean) {
    localStorage.setItem(LS[key], v ? '1' : '0');
  },
};
