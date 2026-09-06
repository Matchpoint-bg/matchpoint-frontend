import { useEffect, useRef } from 'react';
import { useI18n } from '../../../../i18n';
import { Button, Icon, LinkButton } from '../../../../shared/ui';
import type { Lead } from '../../model/lead.types';
import styles from './LeadSuccessPanel.module.css';

interface LeadSuccessPanelProps {
  lead: Lead;
  onSendAnother: () => void;
}

export function LeadSuccessPanel({ lead, onSendAnother }: LeadSuccessPanelProps) {
  const { t } = useI18n();
  const headingRef = useRef<HTMLHeadingElement>(null);

  /*
   * The form is replaced in place, so focus would otherwise fall back to the
   * document and a keyboard or screen-reader user would be left where the
   * submit button used to be, with no idea the inquiry went through.
   */
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className={styles.panel} role="status">
      <span className={styles.mark} aria-hidden="true">
        <Icon name="check" />
      </span>

      <h2 ref={headingRef} tabIndex={-1} className={styles.title}>
        {t('fc_success_title')}
      </h2>
      <p className={styles.desc}>{t('fc_success_desc')}</p>

      {/* A discarded submission has no reference — never invent one to show. */}
      {lead.reference && (
        <p className={styles.reference}>
          {t('fc_success_reference')} <strong>{lead.reference}</strong>
        </p>
      )}

      <p className={styles.next}>{t('fc_success_next')}</p>

      <div className={styles.actions}>
        <LinkButton to="/players" variant="primary" icon="arrowRight" iconPosition="end">
          {t('fc_success_explore')}
        </LinkButton>
        {/* `ghost` is styled for always-dark surfaces (--on-dark) and would be
            white text on this card. */}
        <Button variant="outline" onClick={onSendAnother}>
          {t('fc_success_another')}
        </Button>
      </div>
    </div>
  );
}
