import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../components/Icons';

export type ToastKind = 'ok' | 'err' | undefined;

interface ToastItem {
  id: number;
  msg: string;
  kind: ToastKind;
}

interface ToastValue {
  toast: (msg: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

const DURATION = 3200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const toast = useCallback((msg: string, kind?: ToastKind) => {
    const id = nextId.current++;
    setItems((prev) => [...prev, { id, msg, kind }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), DURATION);
  }, []);

  const value = useMemo<ToastValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts">
        {items.map((t) => (
          <div key={t.id} className={`toast${t.kind ? ` ${t.kind}` : ''}`}>
            <Icon name={t.kind === 'err' ? 'x' : t.kind === 'ok' ? 'check' : 'info'} />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
