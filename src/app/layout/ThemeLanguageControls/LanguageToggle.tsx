import { useI18n } from '../../../i18n';

/**
 * BG ⇄ EN in one button. With exactly two languages a toggle beats a menu, and
 * the label shows the language you would switch *to*, not the one you are in.
 *
 * It lives in both shells' header and on the auth panel, so the marketplace can
 * be read in either language without an account — `.topbar__user`, which holds
 * the account menu's language radios, is hidden below 900px.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, toggleLang, t } = useI18n();
  const next = lang === 'bg' ? 'English' : 'Български';

  return (
    <button
      className={className ? `lang-toggle ${className}` : 'lang-toggle'}
      type="button"
      onClick={toggleLang}
      title={t('language')}
      aria-label={`${t('language')}: ${next}`}
    >
      {lang === 'bg' ? 'EN' : 'BG'}
    </button>
  );
}
