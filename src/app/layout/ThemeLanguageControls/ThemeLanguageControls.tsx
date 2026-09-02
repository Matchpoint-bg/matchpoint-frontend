import { useI18n } from '../../../i18n';
import { Icon } from '../../../shared/ui/Icon';
import { useTheme } from '../../../theme';
import { LanguageToggle } from './LanguageToggle';

/** Language and theme side by side — the auth screens' dark brand panel. */
export function ThemeLanguageControls() {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <LanguageToggle />
      <button
        className="theme-toggle"
        type="button"
        onClick={toggleTheme}
        title={t('theme_label')}
        aria-label={t('theme_label')}
        aria-pressed={theme === 'dark'}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
      </button>
    </>
  );
}
