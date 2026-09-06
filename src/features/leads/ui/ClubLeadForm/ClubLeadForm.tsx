import { useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useI18n } from '../../../../i18n';
import { Button, Field, Input, Textarea } from '../../../../shared/ui';
import { useCreateLeadMutation } from '../../model/lead.queries';
import { leadServerErrors } from '../../model/leadServerErrors';
import {
  EMPTY_LEAD_DRAFT,
  MAX_COURTS,
  MAX_MESSAGE,
  MIN_COURTS,
  leadBodyFromDraft,
  leadFingerprint,
  validateLeadDraft,
} from '../../model/leadValidation';
import type { Lead, LeadDraft, LeadErrorCode, LeadField, LeadServerFieldErrors } from '../../model/lead.types';
import styles from './ClubLeadForm.module.css';

interface ClubLeadFormProps {
  onSuccess: (lead: Lead) => void;
}

/** A person needs longer than this to fill nine fields; a script does not. */
const MIN_FILL_MS = 3000;

export function ClubLeadForm({ onSuccess }: ClubLeadFormProps) {
  const { t } = useI18n();
  const mutation = useCreateLeadMutation();

  const [draft, setDraft] = useState<LeadDraft>(EMPTY_LEAD_DRAFT);
  const [errors, setErrors] = useState<Partial<Record<LeadField, LeadErrorCode>>>({});
  const [serverFields, setServerFields] = useState<LeadServerFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const openedAt = useRef(Date.now());
  /** One token per form instance — a retry of the same inquiry reuses it. */
  const clientToken = useMemo(() => crypto.randomUUID(), []);
  /** Set once a submission succeeds, so an identical resend never posts twice. */
  const sent = useRef<{ fingerprint: string; lead: Lead } | null>(null);

  const setValue = (field: LeadField, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    // A corrected field should stop being flagged, by either kind of error.
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
    setServerFields((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  /** Codes become prose here, so the model layer stays language-free. */
  const message = (field: LeadField): string | undefined => {
    const server = serverFields[field];
    if (server) return server;

    const code = errors[field];
    if (!code) return undefined;
    if (code === 'required') return t('field_required');
    if (code === 'range') return t('fc_err_courts_range');
    if (code === 'too_long') return t('fc_err_too_long');

    // 'invalid' reads differently per field — an email and a phone fail for
    // different reasons, and "invalid value" helps nobody fix either.
    if (field === 'email') return t('email_invalid');
    if (field === 'phone') return t('fc_err_phone');
    if (field === 'website') return t('fc_err_website');
    if (field === 'courtsCount') return t('fc_err_courts_invalid');
    return t('fc_err_invalid');
  };

  /** Moves focus to the first thing that needs fixing, after React paints it. */
  const focusFirstInvalid = () => {
    requestAnimationFrame(() => {
      const target = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      target?.focus();
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mutation.isPending) return;

    setFormError(null);
    setServerFields({});

    const next = validateLeadDraft(draft);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirstInvalid();
      return;
    }

    // Guard 2 of 3: this exact inquiry already went through (double click, or a
    // browser-back onto a filled form). Show the confirmation again, post nothing.
    const fingerprint = leadFingerprint(draft);
    if (sent.current?.fingerprint === fingerprint) {
      onSuccess(sent.current.lead);
      return;
    }

    // Spam friction. Both cases look exactly like success from the outside — a
    // bot that can tell it was caught is a bot that can be rewritten to pass.
    const tooFast = Date.now() - openedAt.current < MIN_FILL_MS;
    if (draft.company.trim() || tooFast) {
      onSuccess({ id: 0, reference: '', status: 'discarded', created_at: new Date().toISOString() });
      return;
    }

    try {
      const lead = await mutation.mutateAsync(leadBodyFromDraft(draft, clientToken));
      sent.current = { fingerprint, lead };
      onSuccess(lead);
    } catch (error) {
      const mapped = leadServerErrors(error);
      setServerFields(mapped.fields);
      setFormError(mapped.formMessage ?? t('fc_err_submit'));
      if (Object.keys(mapped.fields).length > 0) focusFirstInvalid();
    }
  };

  const busy = mutation.isPending;

  return (
    <form ref={formRef} onSubmit={submit} noValidate>
      {/*
        Honeypot: hidden from sight and from the tab order, and named like a
        field a form-filler would want to complete. Left empty by every person.
      */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="lead-company">Company</label>
        <input
          id="lead-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={draft.company}
          onChange={(event) => setValue('company', event.target.value)}
        />
      </div>

      <div className={styles.grid}>
        <Field label={t('fc_club_name')} required error={message('clubName')}>
          {(control) => (
            <Input
              {...control}
              value={draft.clubName}
              onChange={(event) => setValue('clubName', event.target.value)}
              autoComplete="organization"
              disabled={busy}
            />
          )}
        </Field>
        <Field label={t('fc_city')} required error={message('city')}>
          {(control) => (
            <Input
              {...control}
              value={draft.city}
              onChange={(event) => setValue('city', event.target.value)}
              autoComplete="address-level2"
              disabled={busy}
            />
          )}
        </Field>
        <Field label={t('fc_contact_person')} required error={message('contactName')}>
          {(control) => (
            <Input
              {...control}
              value={draft.contactName}
              onChange={(event) => setValue('contactName', event.target.value)}
              autoComplete="name"
              disabled={busy}
            />
          )}
        </Field>
        <Field label={t('fc_courts_count')} required error={message('courtsCount')}>
          {(control) => (
            <Input
              {...control}
              type="number"
              inputMode="numeric"
              min={MIN_COURTS}
              max={MAX_COURTS}
              value={draft.courtsCount}
              onChange={(event) => setValue('courtsCount', event.target.value)}
              disabled={busy}
            />
          )}
        </Field>
        <Field label={t('email')} required error={message('email')}>
          {(control) => (
            <Input
              {...control}
              type="email"
              value={draft.email}
              onChange={(event) => setValue('email', event.target.value)}
              autoComplete="email"
              disabled={busy}
            />
          )}
        </Field>
        <Field label={t('phone')} required error={message('phone')}>
          {(control) => (
            <Input
              {...control}
              type="tel"
              value={draft.phone}
              onChange={(event) => setValue('phone', event.target.value)}
              autoComplete="tel"
              disabled={busy}
            />
          )}
        </Field>
      </div>

      <Field
        label={t('fc_website')}
        note={t('search_optional')}
        hint={t('fc_website_hint')}
        error={message('website')}
      >
        {(control) => (
          <Input
            {...control}
            value={draft.website}
            onChange={(event) => setValue('website', event.target.value)}
            autoComplete="url"
            placeholder="matchpoint.bg"
            disabled={busy}
          />
        )}
      </Field>

      <Field
        label={t('fc_message')}
        note={t('search_optional')}
        hint={`${draft.message.trim().length} / ${MAX_MESSAGE}`}
        error={message('message')}
      >
        {(control) => (
          <Textarea
            {...control}
            value={draft.message}
            onChange={(event) => setValue('message', event.target.value)}
            rows={4}
            disabled={busy}
          />
        )}
      </Field>

      {formError && (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      )}

      <Button type="submit" block icon="arrowRight" iconPosition="end" loading={busy} disabled={busy}>
        {t('fc_form_submit')}
      </Button>

      <p className={styles.consent}>{t('fc_consent')}</p>
    </form>
  );
}
