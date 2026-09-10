import { useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import styles from './ImageUpload.module.css';

/**
 * Extensions the API's `CustomImageFormatValidator` was written to allow.
 *
 * That validator is currently detached from the model fields, so the server
 * accepts anything Pillow can decode and enforces no size limit at all. Until
 * it is reattached, this check is the only thing standing between a user and a
 * 40MB bitmap on the club page — treat it as a real guard, not a hint.
 */
const ACCEPTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const;
const ACCEPT_ATTRIBUTE = 'image/png,image/jpeg,image/webp';
const MAX_BYTES = 5 * 1024 * 1024;

export interface ImageUploadProps {
  /**
   * Called with a file that has already passed extension and size checks.
   *
   * Let rejections through rather than swallowing them: a rejected promise is
   * what rolls the preview back off a failed upload, so the drop zone never
   * shows a photo the server did not accept.
   */
  onSelect: (file: File) => void | Promise<void>;
  /** Shown in the drop zone before a file is picked — usually the current photo. */
  previewUrl?: string;
  label: string;
  hint?: string;
  /** Copy for a file whose extension is not in the whitelist. */
  invalidFormatMessage: string;
  /** Copy for a file over the size cap. */
  tooLargeMessage: string;
  busy?: boolean;
  disabled?: boolean;
  id?: string;
  'aria-describedby'?: string;
}

function extensionOf(file: File): string {
  return file.name.toLowerCase().split('.').pop() ?? '';
}

export function ImageUpload({
  onSelect,
  previewUrl,
  label,
  hint,
  invalidFormatMessage,
  tooLargeMessage,
  busy = false,
  disabled = false,
  id,
  'aria-describedby': describedBy,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Object URLs are held by the browser until explicitly released.
  useEffect(() => {
    if (!localPreview) return;
    return () => URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const accept = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_EXTENSIONS.includes(extensionOf(file) as (typeof ACCEPTED_EXTENSIONS)[number])) {
      setError(invalidFormatMessage);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(tooLargeMessage);
      return;
    }
    setError(null);
    setLocalPreview(URL.createObjectURL(file));
    try {
      await onSelect(file);
    } catch {
      // The caller reports the failure; here we only undo the optimistic
      // preview so the zone falls back to whatever is actually stored.
      setLocalPreview(null);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled || busy) return;
    void accept(event.dataTransfer.files[0]);
  };

  const shown = localPreview ?? previewUrl;
  const errorId = error && id ? `${id}-upload-error` : undefined;

  return (
    <div className={styles.root}>
      <div
        className={`${styles.zone} ${dragging ? styles.dragging : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {shown ? (
          <img className={styles.preview} src={shown} alt="" width="480" height="320" />
        ) : (
          <span className={styles.placeholder} aria-hidden="true">
            <Icon name="image" />
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        className={styles.input}
        accept={ACCEPT_ATTRIBUTE}
        disabled={disabled || busy}
        aria-describedby={[describedBy, errorId].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? true : undefined}
        onChange={(event) => {
          void accept(event.target.files?.[0]);
          // Lets the same file be re-picked after a failed upload.
          event.target.value = '';
        }}
      />

      <div className={styles.actions}>
        <Button
          variant="outline"
          size="sm"
          icon="upload"
          loading={busy}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {label}
        </Button>
        {hint && !error && <span className="small-note">{hint}</span>}
      </div>

      {error && (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
