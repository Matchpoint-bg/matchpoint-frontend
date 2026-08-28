import type { ReactNode } from 'react';
import { I18nProvider } from '../../i18n';
import { ThemeProvider } from '../../theme';
import { AuthProvider } from '../../features/auth';
import { SettingsProvider } from '../../features/preferences';
import { ErrorBoundary } from '../../shared/ui/ErrorBoundary';
import { ModalProvider } from '../../shared/ui/Modal';
import { ToastProvider } from '../../shared/ui/Toast';
import { QueryProvider } from './QueryProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <QueryProvider>
            <SettingsProvider>
              <AuthProvider>
                <ToastProvider>
                  <ModalProvider>{children}</ModalProvider>
                </ToastProvider>
              </AuthProvider>
            </SettingsProvider>
          </QueryProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
