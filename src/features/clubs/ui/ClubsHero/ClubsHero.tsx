import { useI18n } from '../../../../i18n';
import { Icon, Seam } from '../../../../shared/ui/Icon';

interface ClubsHeroProps {
  demo: boolean;
  authenticated: boolean;
  onBrowse: () => void;
  onBookings: () => void;
}

export function ClubsHero({ demo, authenticated, onBrowse, onBookings }: ClubsHeroProps) {
  const { t } = useI18n();

  return (
    <section className="hero">
      <Seam />
      <div className="hero__glow" />
      <div className="hero__eyebrow">{demo ? t('demo_badge') : t('sofia')}</div>
      <h1>
        {t('hero_title1')}
        <br />
        <span>{t('hero_title2')}</span>
      </h1>
      <p>{t('hero_p')}</p>
      <div className="hero__actions">
        <button className="btn btn--primary" onClick={onBrowse}>
          <Icon name="ball" />
          {t('browse_clubs')}
        </button>
        {authenticated && (
          <button className="btn btn--ghost" onClick={onBookings}>
            <Icon name="ticket" />
            {t('my_bookings')}
          </button>
        )}
      </div>
    </section>
  );
}
