import { useI18n } from '../../../../i18n';
import { Field, Select } from '../../../../shared/ui';
import styles from './ClubFilters.module.css';

interface ClubFiltersProps {
  surface: string | null;
  surfaces: string[];
  onSurfaceChange: (surface: string | null) => void;
}

export function ClubFilters({
  surface,
  surfaces,
  onSurfaceChange,
}: ClubFiltersProps) {
  const { t } = useI18n();

  return (
    <div className={styles.filters}>
      <Field label={t('choose_surface')} htmlFor="surface-filter" className={styles.field}>
        {(control) => (
          <Select
            {...control}
            icon="court"
            value={surface ?? ''}
            onChange={(event) => onSurfaceChange(event.target.value || null)}
          >
            <option value="">{t('all_surfaces')}</option>
            {surfaces.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
        )}
      </Field>
    </div>
  );
}
