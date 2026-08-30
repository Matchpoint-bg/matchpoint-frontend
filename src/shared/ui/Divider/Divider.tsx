/** Wraps the global `.hr` rule (src/styles/feedback.css). */
export function Divider({ className }: { className?: string }) {
  return <div className={['hr', className].filter(Boolean).join(' ')} role="separator" />;
}
