import { forwardRef } from 'react';
import { IconButton } from '../IconButton';
import { Input } from './Input';
import type { InputProps } from './Input';
import styles from './SearchInput.module.css';

export interface SearchInputProps extends Omit<InputProps, 'type' | 'icon' | 'endAdornment'> {
  /** Renders a clear button once the field has a value. Needs `value`. */
  onClear?: () => void;
  /** Accessible name for the clear button — required whenever `onClear` is set. */
  clearLabel?: string;
}

/** `Input` preset for free-text search: search semantics + magnifier + clear. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { onClear, clearLabel = 'Clear', value, ...rest },
  ref,
) {
  const showClear = Boolean(onClear) && Boolean(value);

  return (
    <Input
      {...rest}
      ref={ref}
      value={value}
      type="search"
      icon="search"
      autoComplete="off"
      endAdornment={
        showClear ? (
          <IconButton
            icon="x"
            label={clearLabel}
            variant="outline"
            size="sm"
            className={styles.clear}
            onClick={onClear}
          />
        ) : undefined
      }
    />
  );
});
