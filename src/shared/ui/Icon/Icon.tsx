import type { SVGProps } from 'react';

/**
 * The app's icon set. Each entry is the inner markup of a 24x24 (or 400x120, for `seam`)
 * SVG, rendered through <Icon name="..." />. Sizing and color come from CSS, so every
 * path uses `currentColor`.
 */
const PATHS = {
  ball: { viewBox: '0 0 24 24', inner: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M4 7c4 2 4 8 0 10M20 7c-4 2-4 8 0 10" stroke="currentColor" strokeWidth="2"/></> },
  calendar: { viewBox: '0 0 24 24', inner: <><rect x="3" y="4.5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></> },
  clock: { viewBox: '0 0 24 24', inner: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></> },
  pin: { viewBox: '0 0 24 24', inner: <><path d="M12 21c4-4.5 7-8 7-11a7 7 0 1 0-14 0c0 3 3 6.5 7 11Z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2"/></> },
  user: { viewBox: '0 0 24 24', inner: <><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></> },
  back: { viewBox: '0 0 24 24', inner: <><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></> },
  plus: { viewBox: '0 0 24 24', inner: <><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></> },
  edit: { viewBox: '0 0 24 24', inner: <><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></> },
  trash: { viewBox: '0 0 24 24', inner: <><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
  check: { viewBox: '0 0 24 24', inner: <><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></> },
  x: { viewBox: '0 0 24 24', inner: <><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></> },
  court: { viewBox: '0 0 24 24', inner: <><rect x="3" y="4" width="18" height="16" rx="1.5" stroke="currentColor" strokeWidth="2"/><path d="M3 12h18M12 4v16M7 4v16M17 4v16" stroke="currentColor" strokeWidth="1.6"/></> },
  ticket: { viewBox: '0 0 24 24', inner: <><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1 0 4H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" stroke="currentColor" strokeWidth="2"/></> },
  gear: { viewBox: '0 0 24 24', inner: <><circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="2"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></> },
  bulb: { viewBox: '0 0 24 24', inner: <><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.7.6-1 1.2-1 2H9c0-.8-.3-1.4-1-2A6 6 0 0 1 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
  indoor: { viewBox: '0 0 24 24', inner: <><path d="M4 11l8-6 8 6M6 10v9h12v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
  phone: { viewBox: '0 0 24 24', inner: <><path d="M5 4h4l1.5 5-2 1.5a11 11 0 0 0 5 5l1.5-2 5 1.5v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></> },
  mail: { viewBox: '0 0 24 24', inner: <><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="2"/><path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2"/></> },
  download: { viewBox: '0 0 24 24', inner: <><path d="M12 3v11m0 0l4-4m-4 4l-4-4M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
  logout: { viewBox: '0 0 24 24', inner: <><path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 12H3m0 0l3.5-3.5M3 12l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
  info: { viewBox: '0 0 24 24', inner: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 11v5M12 7.6h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></> },
  users: { viewBox: '0 0 24 24', inner: <><circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="2"/><path d="M3 19c0-3 2.7-4.6 6-4.6S15 16 15 19M16 5.2a3.2 3.2 0 0 1 0 6M17 14.5c2.5.5 4 2 4 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></> },
  tag: { viewBox: '0 0 24 24', inner: <><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><circle cx="7.5" cy="7.5" r="1.4" fill="currentColor"/></> },
  ban: { viewBox: '0 0 24 24', inner: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M5.6 5.6l12.8 12.8" stroke="currentColor" strokeWidth="2"/></> },
  bell: { viewBox: '0 0 24 24', inner: <><path d="M6 9a6 6 0 1 1 12 0c0 3.5.8 5.2 1.6 6.2.4.5 0 1.3-.7 1.3H5.1c-.7 0-1.1-.8-.7-1.3C5.2 14.2 6 12.5 6 9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M10 19.5a2.2 2.2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></> },
  seam: { viewBox: '0 0 400 120', inner: <><path d="M-20 60 C 80 -30, 120 150, 200 60 S 320 -30, 420 60" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="6"/></> },
  sun: { viewBox: '0 0 24 24', inner: <><circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></> },
  moon: { viewBox: '0 0 24 24', inner: <><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></> },
  search: { viewBox: '0 0 24 24', inner: <><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2"/><path d="M15.8 15.8L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></> },
  arrowRight: { viewBox: '0 0 24 24', inner: <><path d="M4 12h15m0 0l-5.5-5.5M19 12l-5.5 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></> },
  chevronDown: { viewBox: '0 0 24 24', inner: <><path d="M6 9.5l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></> },
  image: { viewBox: '0 0 24 24', inner: <><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="2"/><circle cx="8.5" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.8"/><path d="M4 17l4.5-4.5 3.5 3.5 3-2.5L20 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
  upload: { viewBox: '0 0 24 24', inner: <><path d="M12 16V4m0 0L8 8m4-4l4 4M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
} as const;

export type IconName = keyof typeof PATHS;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
}

export function Icon({ name, ...rest }: IconProps) {
  const icon = PATHS[name];
  return (
    <svg viewBox={icon.viewBox} fill="none" aria-hidden="true" {...rest}>
      {icon.inner}
    </svg>
  );
}

/**
 * The decorative tennis-ball seam behind hero panels. Needs
 * preserveAspectRatio="none" so it stretches to the container instead of letterboxing.
 */
export function Seam({ className = 'hero__seam' }: { className?: string }) {
  return (
    <div className={className}>
      <Icon name="seam" preserveAspectRatio="none" />
    </div>
  );
}
