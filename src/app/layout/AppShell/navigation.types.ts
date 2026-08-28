import type { IconName } from '../../../shared/ui/Icon';

export type AppTab = 'clubs' | 'reservations' | 'profile' | 'settings';

export interface NavigationItem {
  to: string;
  icon: IconName;
  desktopLabel: string;
  mobileLabel: string;
  tab: AppTab;
}
