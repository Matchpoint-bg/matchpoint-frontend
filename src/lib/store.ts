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
} as const;

export type Theme = 'light' | 'dark';
export type Lang = 'en' | 'bg';

/**
 * localStorage-backed settings. Kept as a plain module (not React state) so the
 * API client can read tokens and the demo flag without being threaded through props.
 * React surfaces that need to re-render on change wrap these in context providers.
 */
export const store = {
  get api(): string {
    return localStorage.getItem(LS.api) || 'http://localhost:8000';
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

  /** Demo mode is ON by default so the design is viewable without a backend. */
  get demo(): boolean {
    return localStorage.getItem(LS.demo) !== '0';
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
};
