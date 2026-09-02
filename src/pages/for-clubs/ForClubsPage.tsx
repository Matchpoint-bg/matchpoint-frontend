import { useState } from 'react';
import type { FormEvent } from 'react';
import { AppShell } from '../../app/layout/AppShell';
import { useI18n } from '../../i18n';
import { Button, Card, CardTitle, Field, Input, Section, Seam, Textarea } from '../../shared/ui';
import { useToast } from '../../shared/ui/Toast';
import styles from './ForClubsPage.module.css';

const EMPTY_FORM = { clubName: '', contactName: '', phone: '', email: '', message: '' };

export function ForClubsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);

  const benefits = [
    { icon: 'ticket', title: t('fc_benefit_bookings_title'), desc: t('fc_benefit_bookings_desc') },
    { icon: 'calendar', title: t('fc_benefit_schedule_title'), desc: t('fc_benefit_schedule_desc') },
    { icon: 'phone', title: t('fc_benefit_calls_title'), desc: t('fc_benefit_calls_desc') },
    { icon: 'gear', title: t('fc_benefit_control_title'), desc: t('fc_benefit_control_desc') },
  ] as const;

  const setValue = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast(t('fc_form_success'), 'ok');
    setForm(EMPTY_FORM);
  };

  return (
    <AppShell active="for-clubs">
      <section className={styles.lead} aria-labelledby="club-inquiry-title">
        <div className={styles.leadCopy}>
          <span className="eyebrow">{t('fc_form_eyebrow')}</span>
          <h1 id="club-inquiry-title">{t('fc_form_title')}</h1>
          <p>{t('fc_form_desc')}</p>
        </div>

        <Card padded className={styles.formCard}>
          <h2>{t('fc_form_heading')}</h2>
          <form onSubmit={submit}>
            <div className={styles.formGrid}>
              <Field label={t('fc_club_name')} required>
                {(control) => <Input {...control} value={form.clubName} onChange={(event) => setValue('clubName', event.target.value)} autoComplete="organization" />}
              </Field>
              <Field label={t('fc_contact_person')} required>
                {(control) => <Input {...control} value={form.contactName} onChange={(event) => setValue('contactName', event.target.value)} autoComplete="name" />}
              </Field>
              <Field label={t('phone')} required>
                {(control) => <Input {...control} type="tel" value={form.phone} onChange={(event) => setValue('phone', event.target.value)} autoComplete="tel" />}
              </Field>
              <Field label={t('email')} required>
                {(control) => <Input {...control} type="email" value={form.email} onChange={(event) => setValue('email', event.target.value)} autoComplete="email" />}
              </Field>
            </div>
            <Field label={t('fc_message')} note={t('search_optional')}>
              {(control) => <Textarea {...control} value={form.message} onChange={(event) => setValue('message', event.target.value)} rows={4} />}
            </Field>
            <Button type="submit" block icon="arrowRight" iconPosition="end">
              {t('fc_form_submit')}
            </Button>
          </form>
        </Card>
      </section>

      <section className="hero">
        <Seam />
        <div className="hero__glow" aria-hidden="true" />
        <span className="hero__eyebrow">{t('fc_eyebrow')}</span>
        <h2 className={styles.heroTitle}>{t('fc_title')}</h2>
        <p>{t('fc_lede')}</p>
        <div className="hero__actions">
          <Button variant="primary" icon="arrowRight" iconPosition="end" onClick={scrollToForm}>
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
    </AppShell>
  );
}

function scrollToForm() {
  const target = document.getElementById('club-inquiry-title');
  if (!target) return;
  target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}
