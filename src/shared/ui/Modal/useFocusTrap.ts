import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Scroll locking is refcounted, so closing one overlay while another is still
 * open does not hand scrolling back to the page underneath.
 */
let lockCount = 0;
let restoreOverflow = '';

function lockScroll() {
  if (lockCount === 0) {
    restoreOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount += 1;
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) document.body.style.overflow = restoreOverflow;
}

/**
 * Modal behaviour shared by `ModalProvider` and `Sheet`: move focus in, keep Tab
 * inside, close on Escape, lock background scroll, and return focus to whatever
 * was focused before on close.
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement>,
  onClose: () => void,
) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    const focusable = () =>
      Array.from(container?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

    (focusable()[0] ?? container)?.focus();
    lockScroll();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusable();
      if (items.length === 0) {
        event.preventDefault();
        container?.focus();
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
      unlockScroll();
      previousFocusRef.current?.focus();
    };
  }, [active, containerRef, onClose]);
}
