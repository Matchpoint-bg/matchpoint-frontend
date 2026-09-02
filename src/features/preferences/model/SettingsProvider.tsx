import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { store } from '../../../shared/storage/store';

interface SettingsValue {
  demo: boolean;
  setDemo: (value: boolean) => void;
  staff: boolean;
  setStaff: (value: boolean) => void;
  admin: boolean;
  setAdmin: (value: boolean) => void;
  apiUrl: string;
  setApiUrl: (value: string) => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [demo, setDemoState] = useState<boolean>(() => store.demo);
  const [staff, setStaffState] = useState<boolean>(() => store.staff);
  const [admin, setAdminState] = useState<boolean>(() => store.admin);
  const [apiUrl, setApiUrlState] = useState<string>(() => store.api);

  const setDemo = useCallback(
    (value: boolean) => {
      store.demo = value;
      queryClient.clear();
      setDemoState(value);
    },
    [queryClient],
  );

  const setStaff = useCallback((value: boolean) => {
    store.staff = value;
    setStaffState(value);
  }, []);

  const setAdmin = useCallback((value: boolean) => {
    store.admin = value;
    setAdminState(value);
  }, []);

  const setApiUrl = useCallback(
    (value: string) => {
      store.api = value;
      queryClient.clear();
      setApiUrlState(value);
    },
    [queryClient],
  );

  const contextValue = useMemo<SettingsValue>(
    () => ({ demo, setDemo, staff, setStaff, admin, setAdmin, apiUrl, setApiUrl }),
    [demo, setDemo, staff, setStaff, admin, setAdmin, apiUrl, setApiUrl],
  );

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside <SettingsProvider>');
  return context;
}
