import { useState } from 'react';
import { AppShell } from '../../app/layout/AppShell';
import { ClubLeadForm, LeadSuccessPanel } from '../../features/leads';
import type { Lead } from '../../features/leads';
import { useI18n } from '../../i18n';
import { Accordion, Button, Card, CardTitle, Icon, Section } from '../../shared/ui';
import type { AccordionItem } from '../../shared/ui';
import { ProductShot } from './ProductShot';
import styles from './ForClubsPage.module.css';

const FORM_ANCHOR = 'club-inquiry';
const HOW_ANCHOR = 'how-it-works';

export function ForClubsPage() {
  const { t } = useI18n();
  const [lead, setLead] = useState<Lead | null>(null);

  const benefits = [
    { icon: 'ticket', title: t('fc_benefit_bookings_title'), desc: t('fc_benefit_bookings_desc') },
    { icon: 'calendar', title: t('fc_benefit_schedule_title'), desc: t('fc_benefit_schedule_desc') },
    { icon: 'phone', title: t('fc_benefit_calls_title'), desc: t('fc_benefit_calls_desc') },
    { icon: 'gear', title: t('fc_benefit_control_title'), desc: t('fc_benefit_control_desc') },
  ] as const;

  const steps = [
    { title: t('fc_how_1_title'), desc: t('fc_how_1_desc') },
    { title: t('fc_how_2_title'), desc: t('fc_how_2_desc') },
    { title: t('fc_how_3_title'), desc: t('fc_how_3_desc') },
  ];

  const shots = [
    { variant: 'schedule', caption: t('fc_shot_schedule_caption') },
    { variant: 'search', caption: t('fc_shot_search_caption') },
    { variant: 'booking', caption: t('fc_shot_booking_caption') },
  ] as const;

  const trust = [
    { icon: 'ban', title: t('fc_trust_data_title'), desc: t('fc_trust_data_desc') },
    { icon: 'tag', title: t('fc_trust_pricing_title'), desc: t('fc_trust_pricing_desc') },
    { icon: 'info', title: t('fc_trust_rules_title'), desc: t('fc_trust_rules_desc') },
    { icon: 'check', title: t('fc_trust_lockin_title'), desc: t('fc_trust_lockin_desc') },
  ] as const;

  const faq: AccordionItem[] = [
    { value: 'cost', title: t('fc_faq_cost_q'), body: <p>{t('fc_faq_cost_a')}</p> },
    { value: 'setup', title: t('fc_faq_setup_q'), body: <p>{t('fc_faq_setup_a')}</p> },
    { value: 'phone', title: t('fc_faq_phone_q'), body: <p>{t('fc_faq_phone_a')}</p> },
    { value: 'data', title: t('fc_faq_data_q'), body: <p>{t('fc_faq_data_a')}</p> },
    { value: 'block', title: t('fc_faq_block_q'), body: <p>{t('fc_faq_block_a')}</p> },
    { value: 'cancel', title: t('fc_faq_cancel_q'), body: <p>{t('fc_faq_cancel_a')}</p> },
    { value: 'equipment', title: t('fc_faq_equipment_q'), body: <p>{t('fc_faq_equipment_a')}</p> },
  ];

  return (
    <AppShell active="for-clubs">
      {/*
        A split hero, not the centred `.hero` the player landing uses. §13 asks
        for the MatchPoint brand without the page reading as the player search
        screen, and the shared tokens carry the brand — the layout is what has
        to differ, so the CTA sits beside the product rather than over a search
        form.
      */}
      <section className={styles.hero} aria-labelledby="fc-hero-title">
        <div className={styles.heroCopy}>
          <span className="eyebrow">{t('fc_eyebrow')}</span>
          <h1 id="fc-hero-title" className={styles.heroTitle}>
            {t('fc_title')}
          </h1>
          <p className={styles.heroLede}>{t('fc_lede')}</p>
          <div className={styles.heroActions}>
            <Button
              variant="primary"
              icon="arrowRight"
              iconPosition="end"
              onClick={() => scrollToAnchor(FORM_ANCHOR)}
            >
              {t('fc_cta')}
            </Button>
            <Button variant="outline" onClick={() => scrollToAnchor(HOW_ANCHOR)}>
              {t('fc_hero_secondary')}
            </Button>
          </div>
        </div>

        <ProductShot variant="schedule" className={styles.heroShot} />
      </section>

      {/* Its own heading: the hero already used fc_eyebrow/fc_title just above. */}
      <Section eyebrow={t('fc_benefits_eyebrow')} title={t('fc_benefits_title')}>
        <div className={styles.benefits}>
          {benefits.map((benefit) => (
            <Card key={benefit.title} padded>
              <CardTitle icon={benefit.icon}>{benefit.title}</CardTitle>
              <p className="muted">{benefit.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      <div id={HOW_ANCHOR}>
        <Section eyebrow={t('fc_how_eyebrow')} title={t('fc_how_title')}>
          {/* An ordered list, because the order is the point. */}
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className="muted">{step.desc}</p>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <Section eyebrow={t('fc_shots_eyebrow')} title={t('fc_shots_title')}>
        <div className={styles.shots}>
          {shots.map((shot) => (
            <figure key={shot.variant} className={styles.shot}>
              <ProductShot variant={shot.variant} />
              <figcaption className={styles.shotCaption}>{shot.caption}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section eyebrow={t('fc_trust_eyebrow')} title={t('fc_trust_title')}>
        <div className={styles.trust}>
          {trust.map((item) => (
            <div key={item.title} className={styles.trustItem}>
              <span className={styles.trustIcon} aria-hidden="true">
                <Icon name={item.icon} />
              </span>
              <div>
                <h3 className={styles.trustTitle}>{item.title}</h3>
                <p className="muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow={t('fc_faq_eyebrow')} title={t('fc_faq_title')}>
        <Accordion items={faq} label={t('fc_faq_title')} className={styles.faq} />
      </Section>

      <section className={styles.lead} id={FORM_ANCHOR} aria-labelledby="club-inquiry-title">
        <div className={styles.leadCopy}>
          <span className="eyebrow">{t('fc_form_eyebrow')}</span>
          <h2 id="club-inquiry-title">{t('fc_form_title')}</h2>
          <p>{t('fc_form_desc')}</p>
        </div>

        <Card padded className={styles.formCard}>
          {lead ? (
            <LeadSuccessPanel lead={lead} onSendAnother={() => setLead(null)} />
          ) : (
            <>
              <h3 className={styles.formHeading}>{t('fc_form_heading')}</h3>
              <ClubLeadForm onSuccess={setLead} />
            </>
          )}
        </Card>
      </section>
    </AppShell>
  );
}

function scrollToAnchor(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  });
}
