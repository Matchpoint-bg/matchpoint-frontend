import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { store } from '../lib/store';
import { api } from '../lib/api';
import type { RegisterPayload, User } from '../types';

interface AuthValue {
  authed: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(() => Boolean(store.access));
  const [user, setUser] = useState<User | null>(() => store.user);

  const sync = useCallback(() => {
    setAuthed(Boolean(store.access));
    setUser(store.user);
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

  const logout = useCallback(() => {
    store.clearTokens();
    sync();
  }, [sync]);

  const value = useMemo<AuthValue>(
    () => ({ authed, user, login, register, logout }),
    [authed, user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
