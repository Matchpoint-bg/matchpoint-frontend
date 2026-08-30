import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent, ReactNode, RefObject } from 'react';

interface MenuContextValue {
  close: () => void;
  /** Registers an item so the arrow keys can walk them in DOM order. */
  register: (node: HTMLElement | null, index: number) => void;
  focusIndex: number;
  setFocusIndex: (index: number) => void;
  nextIndex: () => number;
}

const MenuContext = createContext<MenuContextValue | null>(null);

/** Sentinel: focus the last item once the panel has rendered and registered. */
const FOCUS_LAST = -2;

export function useMenuContext(): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) throw new Error('Menu items must be rendered inside <Menu>');
  return context;
}

export interface MenuProps {
  /** Renders the trigger. Spread `props` onto a button and it wires itself up. */
  trigger: (props: {
    ref: RefObject<HTMLButtonElement>;
    onClick: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
    'aria-haspopup': 'menu';
    'aria-expanded': boolean;
    'aria-controls': string;
  }) => ReactNode;
  /** Names the menu for screen readers. */
  label: string;
  /** Which edge of the trigger the panel aligns to. */
  align?: 'start' | 'end';
  className?: string;
  children: ReactNode;
}

/**
 * Dropdown menu following the ARIA menu button pattern.
 *
 * Deliberately *not* built on `useFocusTrap`: a trap is right for a dialog, but
 * a menu must close when focus leaves rather than cycling focus back into
 * itself. Instead this closes on Escape, on outside pointerdown, on focus
 * leaving the menu, and after any item activates — returning focus to the
 * trigger whenever the close was keyboard-driven.
 */
export function Menu({ trigger, label, align = 'end', className, children }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLElement | null)[]>([]);
  const cursorRef = useRef(0);
  const panelId = `menu-${useId()}`;

  // Items re-register on every render; the counter hands out DOM-order indices.
  cursorRef.current = 0;
  const nextIndex = useCallback(() => {
    const index = cursorRef.current;
    cursorRef.current += 1;
    return index;
  }, []);

  const register = useCallback((node: HTMLElement | null, index: number) => {
    itemsRef.current[index] = node;
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setFocusIndex(-1);
  }, []);

  const closeAndReturnFocus = useCallback(() => {
    close();
    triggerRef.current?.focus();
  }, [close]);

  const openAt = (index: number) => {
    setOpen(true);
    setFocusIndex(index);
  };

  // Move DOM focus to whichever item the roving index points at. FOCUS_LAST is
  // resolved here rather than at keypress time: when the menu is still closed
  // no items have registered yet, so "last" is not knowable until after render.
  useEffect(() => {
    if (!open) return;
    const items = itemsRef.current.filter(Boolean) as HTMLElement[];
    if (focusIndex === FOCUS_LAST) {
      setFocusIndex(Math.max(0, items.length - 1));
      return;
    }
    if (focusIndex < 0) {
      panelRef.current?.focus();
      return;
    }
    items[focusIndex]?.focus();
  }, [focusIndex, open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) close();
    };
    // Focus leaving the menu entirely (Tab away, or a click elsewhere) closes it.
    const onFocusIn = (event: FocusEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) close();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [close, open]);

  const count = () => (itemsRef.current.filter(Boolean) as HTMLElement[]).length;

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const total = count();
    if (event.key === 'Escape') {
      event.preventDefault();
      closeAndReturnFocus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusIndex((current) => (total === 0 ? -1 : (current + 1) % total));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusIndex((current) => (total === 0 ? -1 : (current - 1 + total) % total));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setFocusIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setFocusIndex(total - 1);
    } else if (event.key === 'Tab') {
      close();
    }
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openAt(0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openAt(FOCUS_LAST);
    }
  };

  const value = useMemo<MenuContextValue>(
    () => ({ close: closeAndReturnFocus, register, focusIndex, setFocusIndex, nextIndex }),
    [closeAndReturnFocus, focusIndex, nextIndex, register],
  );

  return (
    <div className={['menu', className].filter(Boolean).join(' ')} ref={wrapRef}>
      {trigger({
        ref: triggerRef,
        onClick: () => (open ? close() : openAt(-1)),
        onKeyDown: onTriggerKeyDown,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': panelId,
      })}
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          className={`menu__panel menu__panel--${align}`}
          role="menu"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={onPanelKeyDown}
        >
          <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
        </div>
      )}
    </div>
  );
}
