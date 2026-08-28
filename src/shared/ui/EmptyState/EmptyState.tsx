import type { ReactNode } from 'react';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';

interface EmptyStateProps {
  title: string;
  desc: string;
  icon?: IconName;
  children?: ReactNode;
}

export function EmptyState({ title, desc, icon = 'ball', children }: EmptyStateProps) {
  return (
    <div className="empty">
      <Icon name={icon} />
      <h3>{title}</h3>
      <p>{desc}</p>
      {children}
    </div>
  );
}
