import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './theme';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { ModalProvider } from './context/ModalContext';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <SettingsProvider>
          <AuthProvider>
            <ToastProvider>
              <ModalProvider>
                <App />
              </ModalProvider>
            </ToastProvider>
          </AuthProvider>
        </SettingsProvider>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
);
