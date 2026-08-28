import { useI18n } from '../../../../../i18n';
import { useClubEmployeesQuery } from '../../../../clubs';
import { EmptyState } from '../../../../../shared/ui/EmptyState';
import { ErrorState } from '../../../../../shared/ui/ErrorState';
import { Spinner } from '../../../../../shared/ui/Spinner';
import styles from './EmployeesModal.module.css';

export function EmployeesModal({ clubId }: { clubId: number }) {
  const { t } = useI18n();
  const { data, error, isPending, refetch } = useClubEmployeesQuery(clubId);

  if (isPending) return <Spinner />;
  if (error) return <ErrorState msg={error.message} onRetry={() => void refetch()} />;
  if (!data?.length) {
    return <EmptyState title={t('no_staff_title')} desc={t('no_staff_desc')} icon="users" />;
  }

  return (
    <div>
      {data.map((employee, index) => (
        <div key={index} className={styles.employee}>
          <div className={`avatar ${styles.avatar}`}>
            {((employee.first_name || '?')[0] || '?').toUpperCase()}
          </div>
          <div className={styles.main}>
            <h3 className={styles.name}>
              {`${employee.first_name || ''} ${employee.last_name || ''}`.trim()}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
}
