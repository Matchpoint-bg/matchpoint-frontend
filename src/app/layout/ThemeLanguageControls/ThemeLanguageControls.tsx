import { useI18n } from '../../../i18n';
import { Icon } from '../../../shared/ui/Icon';
import { useTheme } from '../../../theme';

export function ThemeLanguageControls() {
  const { lang, toggleLang, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <button className="lang-toggle" onClick={toggleLang} title={t('language')}>
        {lang === 'bg' ? 'EN' : 'BG'}
      </button>
      <button className="theme-toggle" onClick={toggleTheme} title={t('theme_label')}>
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
      </button>
    </>
  );
}
