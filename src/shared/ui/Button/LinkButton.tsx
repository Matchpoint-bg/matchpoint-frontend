import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';
import { buttonClassName } from './buttonClassName';
import type { ButtonSize, ButtonVariant } from './buttonClassName';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  icon?: IconName;
  iconPosition?: 'start' | 'end';
  className?: string;
  children?: ReactNode;
}

type RouterLinkProps = CommonProps & Omit<LinkProps, 'className'> & { to: LinkProps['to']; href?: never };
type ExternalLinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> & { href: string; to?: never };

export type LinkButtonProps = RouterLinkProps | ExternalLinkProps;

/** A link that looks like a `Button` — for navigation, not for actions. */
export function LinkButton(props: LinkButtonProps) {
  const { variant, size, block, icon, iconPosition = 'start', className, children, ...rest } = props;
  const iconEl = icon ? <Icon name={icon} aria-hidden="true" focusable="false" /> : null;
  const content = (
    <>
      {iconPosition === 'start' && iconEl}
      {children}
      {iconPosition === 'end' && iconEl}
    </>
  );
  const cls = buttonClassName({ variant, size, block, className });

  if ('to' in rest && rest.to !== undefined) {
    const { to, ...linkRest } = rest as Omit<RouterLinkProps, keyof CommonProps>;
    return (
      <Link {...linkRest} to={to} className={cls}>
        {content}
      </Link>
    );
  }

  return (
    <a {...(rest as Omit<ExternalLinkProps, keyof CommonProps>)} className={cls}>
      {content}
    </a>
  );
}
