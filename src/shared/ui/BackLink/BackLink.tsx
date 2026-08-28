import { Icon } from '../Icon';

export function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return <button className="backlink" onClick={onClick}><Icon name="back" />{label}</button>;
}
