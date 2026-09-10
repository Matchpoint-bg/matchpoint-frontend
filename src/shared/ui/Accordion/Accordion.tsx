import { useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { Icon } from '../Icon';
import styles from './Accordion.module.css';

export interface AccordionItem<T extends string = string> {
  value: T;
  title: ReactNode;
  body: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps<T extends string = string> {
  items: AccordionItem<T>[];
  /** Names the group for screen readers — it has no visible label of its own. */
  label: string;
  /** Open from the start. Ignored once the reader opens something themselves. */
  defaultOpen?: T[];
  /** Allow several panels open at once. Single-open (an exclusive set) by default. */
  multiple?: boolean;
  className?: string;
}

/**
 * Disclosure group: a header button per section, each controlling a region
 * below it.
 *
 * Built to match <Tabs>: arrow keys move between the headers (Home/End jump to
 * the ends, disabled items are skipped rather than focused and rejected), and
 * the panel is hidden with the `hidden` attribute rather than `display: none`
 * in CSS, so assistive tech and in-page find agree with what is on screen.
 *
 * Not a tablist: every panel can be closed, and in `multiple` mode several can
 * be open, neither of which the tab pattern allows.
 */
export function Accordion<T extends string = string>({
  items,
  label,
  defaultOpen = [],
  multiple = false,
  className,
}: AccordionProps<T>) {
  const [open, setOpen] = useState<T[]>(defaultOpen);
  const refs = useRef(new Map<T, HTMLButtonElement>());

  const toggle = (value: T) => {
    setOpen((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value);
      return multiple ? [...current, value] : [value];
    });
  };

  const move = (from: number, step: number) => {
    // Walk in `step` direction, wrapping, until a focusable header is found.
    for (let i = 1; i <= items.length; i += 1) {
      const next = items[(from + step * i + items.length * items.length) % items.length];
      if (next && !next.disabled) return next;
    }
    return undefined;
  };

  const focus = (item: AccordionItem<T> | undefined) => {
    if (item) refs.current.get(item.value)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowDown') focus(move(index, 1));
    else if (event.key === 'ArrowUp') focus(move(index, -1));
    else if (event.key === 'Home') focus(items.find((item) => !item.disabled));
    else if (event.key === 'End') focus([...items].reverse().find((item) => !item.disabled));
    else return;

    event.preventDefault();
  };

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      role="group"
      aria-label={label}
    >
      {items.map((item, index) => {
        const expanded = open.includes(item.value);
        const headerId = `acc-${item.value}-header`;
        const panelId = `acc-${item.value}-panel`;

        return (
          <div key={item.value} className={styles.item}>
            {/* h3: the group sits under a section heading on every screen that uses it. */}
            <h3 className={styles.heading}>
              <button
                ref={(node) => {
                  if (node) refs.current.set(item.value, node);
                  else refs.current.delete(item.value);
                }}
                type="button"
                id={headerId}
                className={styles.trigger}
                aria-expanded={expanded}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggle(item.value)}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
                <span className={styles.title}>{item.title}</span>
                <Icon name="chevronDown" className={styles.chevron} aria-hidden="true" focusable="false" />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={styles.panel}
              hidden={!expanded}
            >
              <div className={styles.panelInner}>{item.body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
