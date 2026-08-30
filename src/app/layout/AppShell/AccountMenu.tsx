import { useAuth } from '../../../features/auth';
import { useI18n } from '../../../i18n';
import {
  Menu,
  MenuCheckbox,
  MenuItem,
  MenuLabel,
  MenuRadio,
  MenuRadioGroup,
  MenuSeparator,
  useToast,
} from '../../../shared/ui';
import { useTheme } from '../../../theme';
import type { AppTab } from './navigation.types';

/**
 * Desktop account menu — the single home for profile, bookings, settings,
 * language, theme and sign out.
 *
 * `.topbar__user` is hidden below 900px, so on mobile these live on the tab bar
 * (profile) and the Settings page (language, theme, sign out).
 */
interface AccountMenuProps {
  /** Player-shell active tab; the club workspace derives its own state. */
  active?: AppTab;
  /**
   * Which shell the menu sits in. The player shell offers a way into the club
   * workspace; the workspace offers the way back, so staff never lose their
   * player account (ToDoRedesign §7 acceptance criterion 2).
   */
  context?: 'player' | 'club';
}

export function AccountMenu({ active, context = 'player' }: AccountMenuProps) {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user, logout, isStaff } = useAuth();
  const { toast } = useToast();

  const initials = ((user?.first_name || user?.email || '?')[0] || '?').toUpperCase();
  const accountName = user?.first_name || t('nav_profile');

  return (
    <Menu
      label={t('account_menu')}
      trigger={(props) => (
        <button
          {...props}
          type="button"
          className={`account-link${active === 'profile' || active === 'settings' ? ' active' : ''}`}
          title={user?.email || t('nav_profile')}
        >
          <span className="avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="account-link__copy">
            <strong>{accountName}</strong>
            <span>{t('nav_profile')}</span>
          </span>
        </button>
      )}
    >
      <MenuLabel>
        {t('signed_in_as')}
        <strong>{user?.email || accountName}</strong>
      </MenuLabel>

      <MenuItem to="/profile" icon="user">
        {t('nav_profile')}
      </MenuItem>
      <MenuItem to="/reservations" icon="ticket">
        {t('my_reservations')}
      </MenuItem>
      <MenuItem to="/settings" icon="gear">
        {t('nav_settings')}
      </MenuItem>

      {isStaff && (
        <>
          <MenuSeparator />
          {context === 'club' ? (
            <MenuItem to="/players" icon="back">
              {t('back_to_player')}
            </MenuItem>
          ) : (
            <MenuItem to="/club" icon="court">
              {t('club_workspace')}
            </MenuItem>
          )}
        </>
      )}

      <MenuSeparator />

      <MenuRadioGroup label={t('language')}>
        <MenuRadio checked={lang === 'bg'} onSelect={() => setLang('bg')}>
          {t('lang_bg')}
        </MenuRadio>
        <MenuRadio checked={lang === 'en'} onSelect={() => setLang('en')}>
          {t('lang_en')}
        </MenuRadio>
      </MenuRadioGroup>

      <MenuCheckbox
        icon={theme === 'dark' ? 'moon' : 'sun'}
        checked={theme === 'dark'}
        onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
      >
        {t('theme_label')}
      </MenuCheckbox>

      <MenuSeparator />

      <MenuItem
        icon="logout"
        danger
        onClick={() => {
          logout();
          toast(t('signed_out'));
        }}
      >
        {t('sign_out')}
      </MenuItem>
    </Menu>
  );
}
