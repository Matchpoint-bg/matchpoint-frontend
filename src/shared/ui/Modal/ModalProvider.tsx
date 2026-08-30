import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useI18n } from '../../../i18n';
import { Icon } from '../Icon';
import { useFocusTrap } from './useFocusTrap';

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
  const openModal = useCallback((title: string, body: ReactNode) => setModal({ title, body }), []);
  const closeModal = useCallback(() => setModal(null), []);
  const value = useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);

  useFocusTrap(Boolean(modal), dialogRef, closeModal);

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
