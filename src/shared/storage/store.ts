import type { User } from '../../features/auth/model/auth.types';

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
 * Built with `VITE_DEMO=1`: the app serves fixtures and makes no API calls at
 * all, which is how the Docker image is shown without a backend. It is a
 * build-time decision on purpose — an ordinary production bundle can never be
 * talked into fabricating data, whatever localStorage holds.
 */
export const DEMO_BUILD = import.meta.env.VITE_DEMO === '1';

/**
 * Whether the development controls (demo toggle, staff view, API URL) exist.
 * A demo build gets them too: it is a build made to be poked at.
 */
export const TOOLS_ENABLED = import.meta.env.DEV || DEMO_BUILD;

export const store = {
  get api(): string {
    // The Settings override only exists where the controls that write it do —
    // so a demo build can also be pointed at a real API to test against.
    if (TOOLS_ENABLED) {
      const override = localStorage.getItem(LS.api);
      if (override) return override;
    }
    return import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');
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
  setTokens(access?: string, refresh?: string) {
    if (access) localStorage.setItem(LS.access, access);
    if (refresh) localStorage.setItem(LS.refresh, refresh);
  },
  clearTokens() {
    [LS.access, LS.refresh, LS.user].forEach((key) => localStorage.removeItem(key));
  },

  get user(): User | null {
    try {
      return JSON.parse(localStorage.getItem(LS.user) || 'null') as User | null;
    } catch {
      return null;
    }
  },
  set user(user: User | null) {
    localStorage.setItem(LS.user, JSON.stringify(user));
  },

  get demo(): boolean {
    if (!TOOLS_ENABLED) return false;
    const override = localStorage.getItem(LS.demo);
    if (override !== null) return override === '1';
    return DEMO_BUILD;
  },
  set demo(value: boolean) {
    localStorage.setItem(LS.demo, value ? '1' : '0');
  },

  get staff(): boolean {
    return localStorage.getItem(LS.staff) === '1';
  },
  set staff(value: boolean) {
    localStorage.setItem(LS.staff, value ? '1' : '0');
  },

  get theme(): Theme {
    return localStorage.getItem(LS.theme) === 'dark' ? 'dark' : 'light';
  },
  set theme(value: Theme) {
    localStorage.setItem(LS.theme, value);
  },

  get lang(): Lang {
    return localStorage.getItem(LS.lang) === 'bg' ? 'bg' : 'en';
  },
  set lang(value: Lang) {
    localStorage.setItem(LS.lang, value);
  },

  get staffClub(): number | null {
    const raw = localStorage.getItem(LS.staffClub);
    const value = raw === null ? NaN : Number(raw);
    return Number.isFinite(value) ? value : null;
  },
  set staffClub(value: number | null) {
    if (value === null) localStorage.removeItem(LS.staffClub);
    else localStorage.setItem(LS.staffClub, String(value));
  },

  notify(key: NotifyKey): boolean {
    return localStorage.getItem(LS[key]) !== '0';
  },
  setNotify(key: NotifyKey, value: boolean) {
    localStorage.setItem(LS[key], value ? '1' : '0');
  },
};
