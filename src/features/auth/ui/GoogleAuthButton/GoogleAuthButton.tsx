import { useI18n } from '../../../../i18n';

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-7.9Z" />
      <path fill="#34A853" d="M12 23c2.9 0 5.3-1 7.1-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.5 1.1-2.7 0-5-1.8-5.9-4.3H2.4v2.8A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M6.1 14.5a6.6 6.6 0 0 1 0-4.2V7.5H2.4a11 11 0 0 0 0 9.8l3.7-2.8Z" />
      <path fill="#EA4335" d="M12 5.5c1.5 0 2.9.5 4 1.5l3-3A11 11 0 0 0 2.4 7.5l3.7 2.8C7 7.8 9.3 5.5 12 5.5Z" />
    </svg>
  );
}

export function GoogleAuthButton({ onClick }: { onClick: () => void }) {
  const { t } = useI18n();
  return (
    <button type="button" className="btn btn--google" onClick={onClick}>
      <GoogleMark />
      {t('continue_google')}
    </button>
  );
}
