import type { FormEvent } from 'react';
import { useI18n } from '../../../../i18n';
import { Icon } from '../../../../shared/ui/Icon';
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
        <label className={styles.field}>
          <span className={styles.label}>{t('search_city')}</span>
          <span className={styles.control}>
            <Icon name="pin" />
            <select
              value={draft.city}
              onChange={(event) => onFieldChange('city', event.target.value)}
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? 'search-city-error' : undefined}
            >
              {SEARCH_CITIES.map((city) => (
                <option key={city} value={city}>{t('sofia')}</option>
              ))}
            </select>
          </span>
          {fieldError('city') && <small id="search-city-error">{fieldError('city')}</small>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>{t('sport')}</span>
          <span className={styles.control}>
            <Icon name="ball" />
            <select
              value={draft.sport}
              onChange={(event) => onFieldChange('sport', event.target.value)}
              aria-invalid={Boolean(errors.sport)}
              aria-describedby={errors.sport ? 'search-sport-error' : undefined}
            >
              {SEARCH_SPORTS.map((sport) => (
                <option key={sport} value={sport}>{t('tennis')}</option>
              ))}
            </select>
          </span>
          {fieldError('sport') && <small id="search-sport-error">{fieldError('sport')}</small>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>{t('search_date')}</span>
          <span className={styles.control}>
            <Icon name="calendar" />
            <input
              type="date"
              min={todayValue()}
              value={draft.date}
              onChange={(event) => onFieldChange('date', event.target.value)}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? 'search-date-error' : undefined}
              required
            />
          </span>
          {fieldError('date') && <small id="search-date-error">{fieldError('date')}</small>}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            {t('search_time')} <em>{t('search_optional')}</em>
          </span>
          <span className={styles.control}>
            <Icon name="clock" />
            <input
              type="time"
              step="1800"
              value={draft.time}
              onChange={(event) => onFieldChange('time', event.target.value)}
              aria-invalid={Boolean(errors.time)}
              aria-describedby={errors.time ? 'search-time-error' : undefined}
            />
          </span>
          {fieldError('time') && <small id="search-time-error">{fieldError('time')}</small>}
        </label>
      </div>

      <div className={styles.formFooter}>
        <div className={styles.quickDates} aria-label={t('search_quick_dates')}>
          <span>{t('search_quick_dates')}</span>
          {quickDates.map((option) => (
            <button
              key={option.label}
              className={draft.date === option.value ? styles.quickDateActive : undefined}
              type="button"
              aria-pressed={draft.date === option.value}
              onClick={() => onFieldChange('date', option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button className={styles.submit} type="submit">
          <span>{t('search_show_clubs')}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
