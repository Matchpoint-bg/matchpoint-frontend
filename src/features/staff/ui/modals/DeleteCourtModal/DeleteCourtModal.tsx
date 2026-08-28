import { Icon } from '../../../../../shared/ui/Icon';
import { useI18n } from '../../../../../i18n';
import { useDeleteCourtMutation } from '../../../../courts';
import type { Court } from '../../../../courts';
import { useStaffAction } from '../../../model/useStaffAction';
import styles from '../StaffModal.module.css';

export function DeleteCourtModal({ court, onDeleted }: { court: Court; onDeleted: () => void }) {
  const { t } = useI18n();
  const mutation = useDeleteCourtMutation();
  const { run, closeModal } = useStaffAction(onDeleted);

  return (
    <div>
      <p className={styles.confirmation}>
        {t('delete_word')} <b>{court.name}</b>{t('delete_court_confirm')}
      </p>
      <div className={styles.actions}>
        <button className="btn btn--outline btn--block" onClick={closeModal}>{t('keep')}</button>
        <button
          className="btn btn--danger btn--block"
          disabled={mutation.isPending}
          onClick={() => void run(() => mutation.mutateAsync(court.id), t('court_deleted'))}
        >
          <Icon name="trash" />
          {t('delete_court')}
        </button>
      </div>
    </div>
  );
}
