import type { Slot } from '../../../courts';
import { useI18n } from '../../../../i18n';
import { fmt } from '../../../../shared/lib/format';

/**
 * Says out loud what the player has just picked (ToDoRedesign §9: selecting a
 * slot must give immediate, accessible feedback — not colour alone).
 *
 * It lives outside `BookingSummary` because the summary only exists once
 * something is selected, and a live region inserted together with its first
 * text is unreliably announced. This one is always mounted and merely changes
 * its contents.
 */
export function SelectionAnnouncer({
  first,
  last,
  total,
  courtName,
}: {
  first?: Slot;
  last?: Slot;
  total: number;
  courtName?: string;
}) {
  const { t } = useI18n();
  const message =
    first && last
      ? `${courtName ? `${courtName} · ` : ''}${first._t || fmt.time(first.start)} – ${fmt.time(last.end)} · ${fmt.money(total)}`
      : '';

  return (
    <p className="sr-only" role="status" aria-live="polite" aria-label={t('your_selection')}>
      {message}
    </p>
  );
}
