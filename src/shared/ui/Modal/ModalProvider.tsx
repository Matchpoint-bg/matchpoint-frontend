import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
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
  const [modal, setModal] = useState<ModalState | null>(null);
  const openModal = useCallback((title: string, body: ReactNode) => setModal({ title, body }), []);
  const closeModal = useCallback(() => setModal(null), []);
  const value = useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      <div
        className={`modal-bg${modal ? ' open' : ''}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}
      >
        <div className="modal" role="dialog" aria-modal="true" aria-label={modal?.title}>
          {modal && (
            <>
              <div className="grabber" />
              <div className="modal__head">
                <h3>{modal.title}</h3>
                <button className="modal__x" aria-label="Close" onClick={closeModal}>
                  <Icon name="x" />
                </button>
              </div>
              <div className="modal__body">{modal.body}</div>
            </>
          )}
        </div>
      </div>
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used inside <ModalProvider>');
  return context;
}
