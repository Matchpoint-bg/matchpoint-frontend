import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

/** Card visuals come from the global `.card` classes in src/styles/content.css. */
interface CardOwnProps {
  /** Adds `.card--pad`. Omit when the card lays out its own padded regions. */
  padded?: boolean;
  /** Adds `.card--link` — hover lift and pointer cursor for a whole-card action. */
  interactive?: boolean;
  className?: string;
  children?: ReactNode;
}

type DivCard = CardOwnProps & { as?: 'div' } & HTMLAttributes<HTMLDivElement>;
type ButtonCard = CardOwnProps & { as: 'button' } & ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorCard = CardOwnProps & { as: 'a' } & AnchorHTMLAttributes<HTMLAnchorElement>;

export type CardProps = DivCard | ButtonCard | AnchorCard;

export function Card(props: CardProps) {
  const { as = 'div', padded, interactive, className, children, ...rest } = props as CardOwnProps & {
    as?: 'div' | 'button' | 'a';
  } & Record<string, unknown>;

  const cls = ['card', interactive && 'card--link', padded && 'card--pad', className]
    .filter(Boolean)
    .join(' ');

  if (as === 'button') {
    return (
      <button type="button" {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} className={cls}>
        {children}
      </button>
    );
  }

  if (as === 'a') {
    return (
      <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <div {...(rest as HTMLAttributes<HTMLDivElement>)} className={cls}>
      {children}
    </div>
  );
}
