import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../Icon';

export type ToastKind = 'ok' | 'err' | undefined;

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const DURATION = 3200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const toast = useCallback((message: string, kind?: ToastKind) => {
    const id = nextId.current++;
    setItems((current) => [...current, { id, message, kind }]);
    setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), DURATION);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts">
        {items.map((item) => (
          <div
            key={item.id}
            className={`toast${item.kind ? ` ${item.kind}` : ''}`}
            role={item.kind === 'err' ? 'alert' : 'status'}
            aria-atomic="true"
          >
            <Icon name={item.kind === 'err' ? 'x' : item.kind === 'ok' ? 'check' : 'info'} />
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
