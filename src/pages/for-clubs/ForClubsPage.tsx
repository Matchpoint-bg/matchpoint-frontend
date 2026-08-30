import { AppShell } from '../../app/layout/AppShell';
import { useI18n } from '../../i18n';
import { Button, Card, CardTitle, Icon, Section, Seam } from '../../shared/ui';
import styles from './ForClubsPage.module.css';

/**
 * B2B landing page.
 *
 * Deliberately a stub: §13 (Phase 6) replaces the contact block below with a
 * real lead form once there is a submission endpoint. Until then the CTA scrolls
 * to an email link rather than a form that cannot submit anywhere.
 */
const CONTACT_EMAIL = 'clubs@matchpoint.bg';

export function ForClubsPage() {
  const { t } = useI18n();

  const benefits = [
    { icon: 'ticket', title: t('fc_benefit_bookings_title'), desc: t('fc_benefit_bookings_desc') },
    { icon: 'calendar', title: t('fc_benefit_schedule_title'), desc: t('fc_benefit_schedule_desc') },
    { icon: 'phone', title: t('fc_benefit_calls_title'), desc: t('fc_benefit_calls_desc') },
    { icon: 'gear', title: t('fc_benefit_control_title'), desc: t('fc_benefit_control_desc') },
  ] as const;

  return (
    <AppShell active="for-clubs">
      <section className="hero">
        <Seam />
        <div className="hero__glow" aria-hidden="true" />
        <span className="hero__eyebrow">{t('fc_eyebrow')}</span>
        <h1>{t('fc_title')}</h1>
        <p>{t('fc_lede')}</p>
        <div className="hero__actions">
          <Button variant="primary" icon="arrowRight" iconPosition="end" onClick={scrollToContact}>
            {t('fc_cta')}
          </Button>
        </div>
      </section>

      <Section eyebrow={t('fc_eyebrow')} title={t('fc_title')}>
        <div className={styles.benefits}>
          {benefits.map((benefit) => (
            <Card key={benefit.title} padded>
              <CardTitle icon={benefit.icon}>{benefit.title}</CardTitle>
              <p className="muted">{benefit.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Card padded className={styles.contact} id="for-clubs-contact" tabIndex={-1}>
        <h2 className={styles.contactTitle}>{t('fc_contact_title')}</h2>
        <p className="muted">{t('fc_contact_desc')}</p>
        <a className="btn btn--primary" href={`mailto:${CONTACT_EMAIL}`}>
          <Icon name="mail" aria-hidden="true" focusable="false" />
          {t('fc_contact_cta')}
        </a>
      </Card>
    </AppShell>
  );
}

function scrollToContact() {
  const target = document.getElementById('for-clubs-contact');
  if (!target) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  // Move focus too, so the CTA lands somewhere for keyboard and screen-reader
  // users rather than only shifting the viewport.
  target.focus();
}
