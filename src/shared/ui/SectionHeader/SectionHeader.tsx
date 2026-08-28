import type { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  sub?: string;
  children?: ReactNode;
}

export function SectionHeader({ eyebrow, title, sub, children }: SectionHeaderProps) {
  return (
    <div className="section-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {children}
    </div>
  );
}
