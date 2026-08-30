import type { FormEvent } from 'react';
import { useI18n } from '../../../../i18n';
import {
  Button,
  ChipRow,
  DateField,
  Field,
  FilterChip,
  Icon,
  Select,
  TimeField,
} from '../../../../shared/ui';
import {
  SEARCH_CITIES,
  SEARCH_SPORTS,
  todayValue,
  tomorrowValue,
  weekendValue,
} from '../../model/searchParams';
import type { SearchDraft, SearchErrors, SearchField } from '../../model/search.types';
import styles from './PlayerSearchForm.module.css';

interface PlayerSearchFormProps {
  draft: SearchDraft;
  errors: SearchErrors;
  invalidUrl: boolean;
  onFieldChange: (field: SearchField, value: string) => void;
  onSubmit: () => void;
}

export function PlayerSearchForm({
  draft,
  errors,
  invalidUrl,
  onFieldChange,
  onSubmit,
}: PlayerSearchFormProps) {
  const { t } = useI18n();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const fieldError = (field: SearchField) => {
    const error = errors[field];
    if (!error) return undefined;
    if (error === 'past') return t('search_date_past');
    if (error === 'unsupported') return t('search_unsupported');
    if (error === 'invalid') return t('search_invalid_value');
    return t('search_required');
  };

  const quickDates = [
    { label: t('search_today'), value: todayValue() },
    { label: t('search_tomorrow'), value: tomorrowValue() },
    { label: t('search_weekend'), value: weekendValue() },
  ];

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.formHeading}>
        <div>
          <span className={styles.formEyebrow}>{t('search_form_eyebrow')}</span>
          <h2>{t('search_form_title')}</h2>
        </div>
        <span className={styles.step}>{t('search_step_one')}</span>
      </div>

      {invalidUrl && (
        <div className={styles.urlNotice} role="status">
          <Icon name="info" />
          <span>
            <strong>{t('search_invalid_url_title')}</strong>
            {t('search_invalid_url_desc')}
          </span>
        </div>
      )}

      <div className={styles.fields}>
        <Field label={t('search_city')} error={fieldError('city')}>
          {(control) => (
            <Select
              {...control}
              icon="pin"
              value={draft.city}
              onChange={(event) => onFieldChange('city', event.target.value)}
            >
              {SEARCH_CITIES.map((city) => (
                <option key={city} value={city}>
                  {t('sofia')}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label={t('sport')} error={fieldError('sport')}>
          {(control) => (
            <Select
              {...control}
              icon="ball"
              value={draft.sport}
              onChange={(event) => onFieldChange('sport', event.target.value)}
            >
              {SEARCH_SPORTS.map((sport) => (
                <option key={sport} value={sport}>
                  {t('tennis')}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label={t('search_date')} required error={fieldError('date')}>
          {(control) => (
            <DateField
              {...control}
              min={todayValue()}
              value={draft.date}
              onChange={(event) => onFieldChange('date', event.target.value)}
            />
          )}
        </Field>

        <Field label={t('search_time')} note={t('search_optional')} error={fieldError('time')}>
          {(control) => (
            <TimeField
              {...control}
              value={draft.time}
              onChange={(event) => onFieldChange('time', event.target.value)}
            />
          )}
        </Field>
      </div>

      <div className={styles.formFooter}>
        <div className={styles.quickDates} role="group" aria-label={t('search_quick_dates')}>
          <span>{t('search_quick_dates')}</span>
          <ChipRow>
            {quickDates.map((option) => (
              <FilterChip
                key={option.label}
                selected={draft.date === option.value}
                onClick={() => onFieldChange('date', option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </ChipRow>
        </div>

        <Button type="submit" block icon="arrowRight" iconPosition="end" className={styles.submit}>
          {t('search_show_clubs')}
        </Button>
      </div>
    </form>
  );
}
