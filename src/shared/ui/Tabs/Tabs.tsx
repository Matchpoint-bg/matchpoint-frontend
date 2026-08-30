import { useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

export interface TabItem<T extends string = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** `tabs` is an underlined row; `segmented` is a pill-shaped switch. */
  variant?: 'tabs' | 'segmented';
  /** Names the tablist for screen readers — required, it has no visible label. */
  label: string;
  /** Ties each tab to the panel it controls, by value. */
  getPanelId?: (value: T) => string;
  className?: string;
}

/**
 * ARIA tablist with roving tabindex: only the selected tab is in the tab order,
 * and Left/Right/Home/End move between tabs (automatic activation — selection
 * follows focus, which is the expected behaviour when panels are cheap).
 *
 * Disabled tabs are skipped by the arrow keys rather than focused and rejected.
 */
export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  variant = 'tabs',
  label,
  getPanelId,
  className,
}: TabsProps<T>) {
  const refs = useRef(new Map<T, HTMLButtonElement>());

  const move = (from: number, step: number) => {
    // Walk in `step` direction, wrapping, until a selectable tab is found.
    for (let i = 1; i <= items.length; i += 1) {
      const next = items[(from + step * i + items.length * items.length) % items.length];
      if (next && !next.disabled) return next;
    }
    return undefined;
  };

  const select = (item: TabItem<T> | undefined) => {
    if (!item) return;
    onChange(item.value);
    refs.current.get(item.value)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const first = items.find((item) => !item.disabled);
    const last = [...items].reverse().find((item) => !item.disabled);

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') select(move(index, 1));
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') select(move(index, -1));
    else if (event.key === 'Home') select(first);
    else if (event.key === 'End') select(last);
    else return;

    event.preventDefault();
  };

  return (
    <div
      className={['tabs', `tabs--${variant}`, className].filter(Boolean).join(' ')}
      role="tablist"
      aria-label={label}
    >
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(node) => {
              if (node) refs.current.set(item.value, node);
              else refs.current.delete(item.value);
            }}
            type="button"
            role="tab"
            className="tabs__tab"
            aria-selected={selected}
            aria-controls={getPanelId?.(item.value)}
            disabled={item.disabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
