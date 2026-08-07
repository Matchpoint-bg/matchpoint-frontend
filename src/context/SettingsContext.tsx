import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { store } from '../lib/store';

interface SettingsValue {
  demo: boolean;
  setDemo: (v: boolean) => void;
  staff: boolean;
  setStaff: (v: boolean) => void;
  apiUrl: string;
  setApiUrl: (v: string) => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

/**
 * Mirrors the demo/staff/apiUrl flags out of localStorage into React state, so toggling
 * one re-renders the views that depend on it.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [demo, setDemoState] = useState<boolean>(() => store.demo);
  const [staff, setStaffState] = useState<boolean>(() => store.staff);
  const [apiUrl, setApiUrlState] = useState<string>(() => store.api);

  const setDemo = useCallback((v: boolean) => {
    store.demo = v;
    setDemoState(v);
  }, []);
  const setStaff = useCallback((v: boolean) => {
    store.staff = v;
    setStaffState(v);
  }, []);
  const setApiUrl = useCallback((v: string) => {
    store.api = v;
    setApiUrlState(v);
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({ demo, setDemo, staff, setStaff, apiUrl, setApiUrl }),
    [demo, setDemo, staff, setStaff, apiUrl, setApiUrl],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
