import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../components/Icons';

interface ModalState {
  title: string;
  body: ReactNode;
}

interface ModalValue {
  openModal: (title: string, body: ReactNode) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null);

  const openModal = useCallback((title: string, body: ReactNode) => setModal({ title, body }), []);
  const closeModal = useCallback(() => setModal(null), []);

  const value = useMemo<ModalValue>(() => ({ openModal, closeModal }), [openModal, closeModal]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      <div
        className={`modal-bg${modal ? ' open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="modal">
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

export function useModal(): ModalValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used inside <ModalProvider>');
  return ctx;
}
