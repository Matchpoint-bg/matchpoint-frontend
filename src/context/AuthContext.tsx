import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { store } from '../lib/store';
import { api, setSessionExpiredHandler } from '../lib/api';
import { apiToLang, useI18n } from '../i18n';
import { useSettings } from './SettingsContext';
import type { RegisterPayload, UpdateUserPayload, User } from '../types';

interface AuthValue {
  /** True until the stored token has been checked against the server. */
  booting: boolean;
  authed: boolean;
  user: User | null;
  /** Server-derived. The dev-only staff toggle can force it on locally. */
  isStaff: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  updateProfile: (payload: UpdateUserPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { demo, staff } = useSettings();
  const { setLang } = useI18n();
  const [authed, setAuthed] = useState<boolean>(() => Boolean(store.access));
  const [user, setUser] = useState<User | null>(() => store.user);
  const [booting, setBooting] = useState<boolean>(() => Boolean(store.access));

  /**
   * The account's preferred_language is adopted as the UI language once per session. The
   * guard matters: without it, every user refresh would stomp a language the user had just
   * chosen from the toggle in the top bar.
   */
  const adoptedLang = useRef(false);
  const adoptServerLang = useCallback(
    (u: User | null) => {
      if (adoptedLang.current) return;
      const l = apiToLang(u?.preferred_language);
      if (l) setLang(l);
      adoptedLang.current = true;
    },
    [setLang],
  );

  const sync = useCallback(() => {
    setAuthed(Boolean(store.access));
    setUser(store.user);
    adoptServerLang(store.user);
  }, [adoptServerLang]);

  /**
   * A token in localStorage only means someone was signed in once. Verify it against the
   * server before rendering the app, so an expired or hand-edited token lands on the sign-in
   * screen instead of a shell where every request fails.
   */
  useEffect(() => {
    if (!store.access) {
      setBooting(false);
      return;
    }
    let cancelled = false;
    setBooting(true);
    void (async () => {
      try {
        const u = await api.me();
        if (cancelled) return;
        store.user = u;
        setUser(u);
        setAuthed(true);
        adoptServerLang(u);
      } catch {
        if (cancelled) return;
        store.clearTokens();
        setUser(null);
        setAuthed(false);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [demo]);

  // A refresh that the server rejects mid-session must land the user back on sign-in.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setAuthed(false);
      setUser(null);
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      await api.login(email, password);
      sync();
    },
    [sync],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await api.register(payload);
      sync();
    },
    [sync],
  );

  const updateProfile = useCallback(async (payload: UpdateUserPayload) => {
    setUser(await api.updateUser(payload));
  }, []);

  const logout = useCallback(() => {
    store.clearTokens();
    sync();
  }, [sync]);

  const isStaff = useMemo(
    () => Boolean(user?.is_staff || user?.is_superuser) || (import.meta.env.DEV && staff),
    [user, staff],
  );

  const value = useMemo<AuthValue>(
    () => ({ booting, authed, user, isStaff, login, register, updateProfile, logout }),
    [booting, authed, user, isStaff, login, register, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
