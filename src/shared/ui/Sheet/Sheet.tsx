import { useCallback, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { useI18n } from '../../../i18n';
import { Icon } from '../Icon';
import { useFocusTrap } from '../Modal/useFocusTrap';

export type SheetPlacement = 'bottom' | 'side';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /**
   * `bottom` is a mobile bottom sheet that becomes a centred dialog on desktop.
   * `side` keeps the bottom sheet on mobile but docks to the right edge as a
   * full-height panel from 640px up — the shape a booking summary or a filter
   * panel wants.
   */
  placement?: SheetPlacement;
  /** Pinned below the scrolling body — the place for the primary action. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Declarative overlay, for the cases `useModal` cannot serve: content that has
 * to re-render with the page's own state, or that needs a pinned footer.
 *
 * Shares `useFocusTrap` with `ModalProvider`, so focus handling, Escape and the
 * scroll lock behave identically in both.
 */
export function Sheet({ open, onClose, title, placement = 'bottom', footer, children }: SheetProps) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = `sheet-${useId()}`;
  // The trap calls this on Escape; stable so the effect does not re-run.
  const close = useCallback(() => onClose(), [onClose]);

  useFocusTrap(open, dialogRef, close);

  return createPortal(
    <div
      className={`modal-bg sheet-bg sheet-bg--${placement}${open ? ' open' : ''}`}
      aria-hidden={!open}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {open && (
        <div
          ref={dialogRef}
          className={`modal sheet sheet--${placement}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
        >
          <div className="grabber" />
          <div className="modal__head">
            <h3 id={titleId}>{title}</h3>
            <button className="modal__x" type="button" aria-label={t('close')} onClick={onClose}>
              <Icon name="x" />
            </button>
          </div>
          <div className="modal__body sheet__body">{children}</div>
          {footer && <div className="sheet__foot">{footer}</div>}
        </div>
      )}
    </div>,
    document.body,
  );
}
