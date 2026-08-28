import { useCallback, useEffect, useState } from 'react';
import { LS } from '../storage/store';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let captured: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  captured = event as BeforeInstallPromptEvent;
  window.dispatchEvent(new Event('mp:installable'));
});

export function useInstallPrompt() {
  const [available, setAvailable] = useState(() => captured !== null);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(LS.dismissInstall) === '1',
  );

  useEffect(() => {
    const onChange = () => setAvailable(captured !== null);
    window.addEventListener('mp:installable', onChange);
    return () => window.removeEventListener('mp:installable', onChange);
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!captured) return false;
    await captured.prompt();
    const { outcome } = await captured.userChoice;
    captured = null;
    setAvailable(false);
    return outcome === 'accepted';
  }, []);

  const dismissBanner = useCallback(() => {
    localStorage.setItem(LS.dismissInstall, '1');
    setDismissed(true);
  }, []);

  return { available, dismissed, promptInstall, dismissBanner };
}
