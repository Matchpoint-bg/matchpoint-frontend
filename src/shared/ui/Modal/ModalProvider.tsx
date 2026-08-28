import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useI18n } from '../../../i18n';
import { Icon } from '../Icon';

interface ModalState {
  title: string;
  body: ReactNode;
}

interface ModalContextValue {
  openModal: (title: string, body: ReactNode) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [modal, setModal] = useState<ModalState | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const previousBodyOverflowRef = useRef('');
  const openModal = useCallback((title: string, body: ReactNode) => setModal({ title, body }), []);
  const closeModal = useCallback(() => setModal(null), []);
  const value = useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);

  useEffect(() => {
    if (!modal) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    (focusable()[0] ?? dialog)?.focus();
    previousBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusable();
      if (items.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousBodyOverflowRef.current;
      previousFocusRef.current?.focus();
    };
  }, [closeModal, modal]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      <div
        className={`modal-bg${modal ? ' open' : ''}`}
        aria-hidden={!modal}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}
      >
        {modal && (
          <div
            ref={dialogRef}
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-modal-title"
            tabIndex={-1}
          >
            <>
              <div className="grabber" />
              <div className="modal__head">
                <h3 id="app-modal-title">{modal.title}</h3>
                <button className="modal__x" aria-label={t('close')} onClick={closeModal}>
                  <Icon name="x" />
                </button>
              </div>
              <div className="modal__body">{modal.body}</div>
            </>
          </div>
        )}
      </div>
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used inside <ModalProvider>');
  return context;
}
