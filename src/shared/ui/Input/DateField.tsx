import { DayPicker } from '@daypicker/react';
import { bg, enGB } from '@daypicker/react/locale';
import '@daypicker/react/style.css';
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../../i18n';
import { fmt } from '../../lib/format';
import { Icon } from '../Icon';
import styles from './DateField.module.css';

export interface DateFieldProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  min?: string;
  max?: string;
  name?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

function parseIsoDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export const DateField = forwardRef<HTMLButtonElement, DateFieldProps>(function DateField(
  { value, defaultValue, min, max, name, placeholder, disabled, className, onValueChange, onBlur, ...rest },
  forwardedRef,
) {
  const { lang, t } = useI18n();
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({ visibility: 'hidden' });
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLSpanElement>(null);
  const currentValue = value ?? internalValue;
  const selected = parseIsoDate(currentValue);
  const minDate = parseIsoDate(min);
  const maxDate = parseIsoDate(max);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !popoverRef.current?.contains(target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;

    const positionPopover = () => {
      const trigger = triggerRef.current;
      const popover = popoverRef.current;
      if (!trigger || !popover) return;

      const gap = 10;
      const edge = 12;
      const triggerRect = trigger.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      const spaceBelow = window.innerHeight - triggerRect.bottom - gap;
      const opensAbove = spaceBelow < popoverRect.height && triggerRect.top - gap >= popoverRect.height;
      const idealTop = opensAbove
        ? triggerRect.top - popoverRect.height - gap
        : triggerRect.bottom + gap;

      setPopoverStyle({
        visibility: 'visible',
        top: Math.max(edge, Math.min(idealTop, window.innerHeight - popoverRect.height - edge)),
        left: Math.max(edge, Math.min(triggerRect.right - popoverRect.width, window.innerWidth - popoverRect.width - edge)),
        transformOrigin: opensAbove ? 'bottom right' : 'top right',
      });
    };

    positionPopover();
    window.addEventListener('resize', positionPopover);
    window.addEventListener('scroll', positionPopover, true);
    return () => {
      window.removeEventListener('resize', positionPopover);
      window.removeEventListener('scroll', positionPopover, true);
    };
  }, [open]);

  const label = selected
    ? new Intl.DateTimeFormat(lang === 'bg' ? 'bg-BG' : 'en-GB', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      }).format(selected)
    : placeholder ?? t('search_date');

  return (
    <span className={styles.root} ref={rootRef}>
      {name && <input type="hidden" name={name} value={currentValue} />}
      <button
        {...rest}
        ref={(node) => {
          triggerRef.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        type="button"
        className={[styles.trigger, className].filter(Boolean).join(' ')}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onBlur={onBlur}
        onClick={() => setOpen((visible) => !visible)}
      >
        <Icon name="calendar" />
        <span className={selected ? undefined : styles.placeholder}>{label}</span>
        <Icon name="chevronDown" className={open ? styles.chevronOpen : undefined} />
      </button>
      {open && createPortal(
        <span
          ref={popoverRef}
          className={styles.popover}
          style={popoverStyle}
          role="dialog"
          aria-label={t('search_date')}
        >
          <DayPicker
            mode="single"
            locale={lang === 'bg' ? bg : enGB}
            selected={selected}
            defaultMonth={selected ?? minDate ?? new Date()}
            startMonth={minDate}
            endMonth={maxDate}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            fixedWeeks
            showOutsideDays
            navLayout="around"
            autoFocus
            onSelect={(day) => {
              if (!day) return;
              const nextValue = fmt.isoDate(day);
              if (value === undefined) setInternalValue(nextValue);
              onValueChange?.(nextValue);
              setOpen(false);
              requestAnimationFrame(() => triggerRef.current?.focus());
            }}
          />
        </span>,
        document.body,
      )}
    </span>
  );
});
