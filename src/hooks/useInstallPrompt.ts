import { useCallback, useEffect, useState } from 'react';
import { LS } from '../lib/store';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let captured: BeforeInstallPromptEvent | null = null;

// Captured at module load: the browser can fire this before React mounts.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  captured = e as BeforeInstallPromptEvent;
  window.dispatchEvent(new Event('mp:installable'));
});

export function useInstallPrompt() {
  const [available, setAvailable] = useState<boolean>(() => captured !== null);
  const [dismissed, setDismissed] = useState<boolean>(
    () => localStorage.getItem(LS.dismissInstall) === '1',
  );

  useEffect(() => {
    const onChange = () => setAvailable(captured !== null);
    window.addEventListener('mp:installable', onChange);
    return () => window.removeEventListener('mp:installable', onChange);
  }, []);

  /** Resolves true if the prompt was shown, false if there was nothing to show. */
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
