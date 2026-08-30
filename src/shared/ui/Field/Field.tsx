import { useId } from 'react';
import type { ReactNode } from 'react';

/**
 * Accessibility wrapper for a single form control.
 *
 * `Field` owns the ids: it labels the control, and wires `aria-invalid` and
 * `aria-describedby` to the hint and error it renders, so an error is always
 * programmatically associated with the input it belongs to. Children receive
 * those props through a render callback:
 *
 *   <Field label="Email" error={emailError}>
 *     {(props) => <Input type="email" {...props} />}
 *   </Field>
 *
 * A plain ReactNode child is also accepted for controls that manage their own
 * ids (a group of chips, a custom picker); in that case pass `htmlFor`.
 */
export interface FieldControlProps {
  id: string;
  'aria-invalid': boolean | undefined;
  'aria-describedby': string | undefined;
  required: boolean | undefined;
}

export interface FieldProps {
  label?: ReactNode;
  /** Trails the label — "optional", "max 200 chars". */
  note?: ReactNode;
  hint?: ReactNode;
  /** Any truthy value marks the control invalid and renders the message. */
  error?: ReactNode;
  required?: boolean;
  /** Set when passing a ReactNode child that owns its own id. */
  htmlFor?: string;
  className?: string;
  children: ReactNode | ((props: FieldControlProps) => ReactNode);
}

export function Field({
  label,
  note,
  hint,
  error,
  required,
  htmlFor,
  className,
  children,
}: FieldProps) {
  const reactId = useId();
  const id = htmlFor ?? `field-${reactId}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const control =
    typeof children === 'function'
      ? children({
          id,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy,
          required,
        })
      : children;

  return (
    <div className={['field', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
          {note && <span className="field__note">{note}</span>}
        </label>
      )}
      {control}
      {hint && (
        <small className="field__hint" id={hintId}>
          {hint}
        </small>
      )}
      {error && (
        <small className="field__error" id={errorId} role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
