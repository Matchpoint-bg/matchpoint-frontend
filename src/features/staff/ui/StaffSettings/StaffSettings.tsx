import { useState } from 'react';
import { useClubsQuery } from '../../../clubs';
import { useI18n } from '../../../../i18n';
import { store } from '../../../../shared/storage/store';
import { CardTitle } from '../../../../shared/ui/CardTitle';
import { EmptyState } from '../../../../shared/ui/EmptyState';
import { ErrorState } from '../../../../shared/ui/ErrorState';
import { Spinner } from '../../../../shared/ui/Spinner';
import { CourtsManager } from '../CourtsManager';
import { OpeningHoursEditor } from '../OpeningHoursEditor';
import styles from './StaffSettings.module.css';

export function StaffSettings() {
  const { t } = useI18n();
  const clubsQuery = useClubsQuery();
  const [clubId, setClubIdState] = useState<number | null>(() => store.staffClub);
  const setClubId = (value: number | null) => {
    store.staffClub = value;
    setClubIdState(value);
  };

  if (clubsQuery.isPending) return <Spinner />;
  if (clubsQuery.error) {
    return (
      <ErrorState
        msg={clubsQuery.error.message}
        onRetry={() => void clubsQuery.refetch()}
      />
    );
  }
  const clubs = clubsQuery.data ?? [];
  if (!clubs.length) {
    return (
      <EmptyState
        title={t('no_clubs_staff')}
        desc={t('staff_club_desc')}
        icon="info"
      />
    );
  }

  const known = clubs.some((club) => club.id === clubId);
  const selected = known ? clubId : clubs.length === 1 ? (clubs[0]?.id ?? null) : null;

  return (
    <>
      <div className="card card--pad">
        <CardTitle icon="gear">{t('staff_club_card')}</CardTitle>
        <div className="toggle">
          <div className="t">
            <b>{t('staff_club_desc')}</b>
          </div>
          <select
            className={styles.select}
            value={selected ?? ''}
            aria-label={t('staff_club_card')}
            onChange={(event) =>
              setClubId(event.target.value ? Number(event.target.value) : null)
            }
          >
            <option value="">—</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {selected === null ? (
        <p className={`small-note ${styles.note}`}>{t('select_club_first')}</p>
      ) : (
        <>
          <div className={`card card--pad ${styles.card}`}>
            <CardTitle icon="clock">{t('hours_card')}</CardTitle>
            <p className={`small-note ${styles.intro}`}>
              {t('hours_card_desc')}
            </p>
            <OpeningHoursEditor clubId={selected} />
          </div>
          <div className={`card card--pad ${styles.card}`}>
            <CardTitle icon="court">{t('courts_card')}</CardTitle>
            <p className={`small-note ${styles.intro}`}>
              {t('courts_card_desc')}
            </p>
            <CourtsManager clubId={selected} />
          </div>
        </>
      )}
    </>
  );
}
