import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { apiToLang, useI18n } from '../../../i18n';
import { setSessionExpiredHandler } from '../../../shared/api/httpClient';
import { store } from '../../../shared/storage/store';
import { useSettings } from '../../preferences/model/SettingsProvider';
import { authApi } from '../api/auth.api';
import type { RegisterPayload, UpdateUserPayload, User } from './auth.types';

interface AuthValue {
  booting: boolean;
  authed: boolean;
  user: User | null;
  isStaff: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  updateProfile: (payload: UpdateUserPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { demo, staff } = useSettings();
  const { setLang } = useI18n();
  const [authed, setAuthed] = useState(() => Boolean(store.access));
  const [user, setUser] = useState<User | null>(() => store.user);
  const [booting, setBooting] = useState(() => Boolean(store.access));
  const adoptedLang = useRef(false);

  const adoptServerLang = useCallback(
    (currentUser: User | null) => {
      if (adoptedLang.current) return;
      const language = apiToLang(currentUser?.preferred_language);
      if (language) setLang(language);
      adoptedLang.current = true;
    },
    [setLang],
  );

  const sync = useCallback(() => {
    setAuthed(Boolean(store.access));
    setUser(store.user);
    adoptServerLang(store.user);
  }, [adoptServerLang]);

  useEffect(() => {
    if (!store.access) {
      setBooting(false);
      return;
    }
    let cancelled = false;
    setBooting(true);
    void (async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        if (cancelled) return;
        store.user = currentUser;
        setUser(currentUser);
        setAuthed(true);
        adoptServerLang(currentUser);
      } catch {
        if (cancelled) return;
        store.clearTokens();
        queryClient.clear();
        setUser(null);
        setAuthed(false);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [adoptServerLang, demo, queryClient]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      queryClient.clear();
      setAuthed(false);
      setUser(null);
    });
    return () => setSessionExpiredHandler(null);
  }, [queryClient]);

  const login = useCallback(
    async (email: string, password: string) => {
      await authApi.login(email, password);
      queryClient.clear();
      sync();
    },
    [queryClient, sync],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authApi.register(payload);
      queryClient.clear();
      sync();
    },
    [queryClient, sync],
  );

  const updateProfile = useCallback(async (payload: UpdateUserPayload) => {
    setUser(await authApi.updateUser(payload));
  }, []);

  const logout = useCallback(() => {
    store.clearTokens();
    queryClient.clear();
    sync();
  }, [queryClient, sync]);

  const isStaff = useMemo(
    () => Boolean(user?.is_staff || user?.is_superuser) || (import.meta.env.DEV && staff),
    [user, staff],
  );

  const contextValue = useMemo<AuthValue>(
    () => ({ booting, authed, user, isStaff, login, register, updateProfile, logout }),
    [booting, authed, user, isStaff, login, register, updateProfile, logout],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
