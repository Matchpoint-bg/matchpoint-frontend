import { useI18n } from '../../../i18n';
import { Icon } from '../../../shared/ui/Icon';
import { useTheme } from '../../../theme';

export function ThemeLanguageControls() {
  const { lang, toggleLang, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <button
        className="lang-toggle"
        type="button"
        onClick={toggleLang}
        title={t('language')}
        aria-label={`${t('language')}: ${lang === 'bg' ? 'English' : 'Български'}`}
      >
        {lang === 'bg' ? 'EN' : 'BG'}
      </button>
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
