import { useSettings } from '../../../features/preferences';
import { useI18n } from '../../../i18n';
import { Badge } from '../../../shared/ui';

/**
 * Says out loud that nothing on screen is real.
 *
 * A demo build looks exactly like production, so every screen has to carry the
 * warning — a club shown fabricated bookings without one would be right to
 * distrust the real thing. Renders nothing when the app is on the live API.
 */
export function DemoBadge() {
  const { demo } = useSettings();
  const { t } = useI18n();
  if (!demo) return null;
  return (
    <Badge tone="warning" icon="bulb" title={t('demo_badge_title')}>
      {t('demo_badge')}
    </Badge>
  );
}
