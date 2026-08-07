import type { ReactNode } from 'react';
import { Icon } from './Icons';
import type { IconName } from './Icons';
import { useI18n } from '../i18n';

export function Spinner() {
  return <div className="spinner" />;
}

export function Skeleton({ height, count = 1 }: { height: number; count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skel" style={{ height }} />
      ))}
    </>
  );
}

export function EmptyState({
  title,
  desc,
  icon = 'ball',
  children,
}: {
  title: string;
  desc: string;
  icon?: IconName;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <Icon name={icon} />
      <h3>{title}</h3>
      <p>{desc}</p>
      {children}
    </div>
  );
}

export function ErrorState({ msg, onRetry }: { msg?: string; onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="empty">
      <Icon name="info" />
      <h3>{t('couldnt_load')}</h3>
      <p>{msg}</p>
      <button className="btn btn--soft btn--sm" style={{ marginTop: 6 }} onClick={onRetry}>
        {t('retry')}
      </button>
      <p className="small-note">{t('try_backend_note')}</p>
    </div>
  );
}
