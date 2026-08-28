import { useI18n } from '../../../../i18n';
import type { AuthMode } from '../../model/useAuthFlow';

interface AuthModeTabsProps {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
}

export function AuthModeTabs({ mode, onChange }: AuthModeTabsProps) {
  const { t } = useI18n();

  return (
    <div className="authtabs" role="tablist">
      <button
        role="tab"
        aria-selected={mode === 'login'}
        className={mode === 'login' ? 'active' : ''}
        onClick={() => onChange('login')}
      >
        {t('sign_in')}
      </button>
      <button
        role="tab"
        aria-selected={mode === 'register'}
        className={mode === 'register' ? 'active' : ''}
        onClick={() => onChange('register')}
      >
        {t('create_account')}
      </button>
    </div>
  );
}
