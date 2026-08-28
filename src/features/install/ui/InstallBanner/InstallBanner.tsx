import { useI18n } from '../../../../i18n';
import { useInstallPrompt } from '../../../../shared/hooks/useInstallPrompt';
import { Icon } from '../../../../shared/ui/Icon';
import { useToast } from '../../../../shared/ui/Toast';

export function InstallBanner() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { available, dismissed, promptInstall, dismissBanner } = useInstallPrompt();

  if (!available || dismissed) return null;

  return (
    <div className="install">
      <img src="/icons/icon-192.png" alt="" />
      <div className="t">
        <b>{t('install_banner_title')}</b>
        <small>{t('install_banner_desc')}</small>
      </div>
      <button
        className="btn btn--primary btn--sm"
        onClick={async () => {
          if (await promptInstall()) toast(t('installing'), 'ok');
        }}
      >
        <Icon name="download" />
        {t('install')}
      </button>
      <button className="x" onClick={dismissBanner} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
