import type { IconName } from '../../../shared/ui/Icon';

/** Destinations of the club operator workspace (ToDoRedesign §4). */
export type ClubTab = 'overview' | 'schedule' | 'bookings' | 'courts' | 'team' | 'settings';

export interface ClubNavItem {
  to: string;
  icon: IconName;
  label: string;
  /** Mobile tab label; the bottom bar is tighter than the sidebar. */
  shortLabel: string;
  tab: ClubTab;
  /** Routes this item also owns — used by the mobile "More" tab. */
  alsoActiveFor?: ClubTab[];
}
