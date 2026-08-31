import type { FormEvent } from 'react';
import { useI18n } from '../../../../i18n';
import {
  Button,
  DateField,
  Field,
  Icon,
  Select,
} from '../../../../shared/ui';
import {
  SEARCH_CITIES,
  SEARCH_SPORTS,
  todayValue,
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

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.formHeading}>
        <h2>{t('search_form_title')}</h2>
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
      </div>

      <div className={styles.formFooter}>
        <Button type="submit" block icon="arrowRight" iconPosition="end" className={styles.submit}>
          {t('search_show_clubs')}
        </Button>
      </div>
    </form>
  );
}
