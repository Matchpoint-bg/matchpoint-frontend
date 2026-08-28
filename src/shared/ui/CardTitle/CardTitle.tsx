import { Icon } from '../Icon';
import type { IconName } from '../Icon';
import styles from './CardTitle.module.css';

export function CardTitle({ icon, children }: { icon: IconName; children: string }) {
  return (
    <div className={styles.title}>
      <span className={styles.icon}><Icon name={icon} /></span>
      <b>{children}</b>
    </div>
  );
}
