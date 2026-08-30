import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';
import { useMenuContext } from './Menu';

/**
 * Shared plumbing for every focusable menu row: claim a DOM-order index, report
 * the node up to `Menu` so the arrow keys can reach it, and carry the roving
 * tabindex (only the focused row is tabbable).
 */
function useMenuRow() {
  const { register, focusIndex, nextIndex } = useMenuContext();
  const indexRef = useRef(-1);
  // Re-claimed on every render, so indices follow DOM order even as items
  // appear and disappear.
  indexRef.current = nextIndex();
  const index = indexRef.current;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    register(ref.current, index);
    return () => register(null, index);
  });

  return {
    index,
    setNode: (node: HTMLElement | null) => {
      ref.current = node;
    },
    tabIndex: focusIndex === index ? 0 : -1,
  };
}

interface RowContentProps {
  icon?: IconName;
  children: ReactNode;
  /** Trailing text — a current value, a shortcut hint. */
  hint?: ReactNode;
}

function RowContent({ icon, children, hint }: RowContentProps) {
  return (
    <>
      {icon && <Icon name={icon} aria-hidden="true" focusable="false" />}
      <span className="menu__label">{children}</span>
      {hint && <span className="menu__hint">{hint}</span>}
    </>
  );
}

export interface MenuItemProps extends RowContentProps {
  /** Renders a router Link instead of a button. */
  to?: string;
  onClick?: () => void;
  /** Styles the row as destructive (sign out, delete). */
  danger?: boolean;
  disabled?: boolean;
}

export function MenuItem({ to, onClick, danger, disabled, ...content }: MenuItemProps) {
  const { close } = useMenuContext();
  const { setNode, tabIndex } = useMenuRow();
  const className = ['menu__item', danger && 'menu__item--danger'].filter(Boolean).join(' ');

  const activate = () => {
    onClick?.();
    close();
  };

  if (to) {
    return (
      <Link
        ref={setNode}
        to={to}
        role="menuitem"
        tabIndex={tabIndex}
        className={className}
        onClick={activate}
      >
        <RowContent {...content} />
      </Link>
    );
  }

  return (
    <button
      ref={setNode}
      type="button"
      role="menuitem"
      tabIndex={tabIndex}
      className={className}
      disabled={disabled}
      onClick={activate}
    >
      <RowContent {...content} />
    </button>
  );
}

export interface MenuCheckboxProps extends RowContentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** A row that toggles a setting in place — the menu stays open. */
export function MenuCheckbox({ checked, onChange, ...content }: MenuCheckboxProps) {
  const { setNode, tabIndex } = useMenuRow();

  return (
    <button
      ref={setNode}
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={tabIndex}
      className="menu__item menu__item--toggle"
      onClick={() => onChange(!checked)}
    >
      <RowContent {...content} />
      <span className="menu__check" aria-hidden="true">
        {checked && <Icon name="check" />}
      </span>
    </button>
  );
}

export interface MenuRadioProps extends RowContentProps {
  checked: boolean;
  onSelect: () => void;
}

/** One option of a `MenuRadioGroup`. Selecting keeps the menu open. */
export function MenuRadio({ checked, onSelect, ...content }: MenuRadioProps) {
  const { setNode, tabIndex } = useMenuRow();

  return (
    <button
      ref={setNode}
      type="button"
      role="menuitemradio"
      aria-checked={checked}
      tabIndex={tabIndex}
      className="menu__item menu__item--toggle"
      onClick={onSelect}
    >
      <RowContent {...content} />
      <span className="menu__check" aria-hidden="true">
        {checked && <Icon name="check" />}
      </span>
    </button>
  );
}

/** Groups radio rows so their shared purpose is announced once. */
export function MenuRadioGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      {children}
    </div>
  );
}

export function MenuSeparator() {
  return <div className="menu__sep" role="separator" />;
}

/** Non-interactive heading — skipped by the arrow keys by design. */
export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="menu__head">{children}</div>;
}
