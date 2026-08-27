import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ClubsPage } from './pages/ClubsPage';
import { ClubDetailPage } from './pages/ClubDetailPage';
import { CourtDetailPage } from './pages/CourtDetailPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Spinner } from './components/States';
import { useAuth } from './context/AuthContext';

/** Sends signed-out visitors to /login, remembering where they were headed. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  const location = useLocation();
  if (!authed) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

/** Keeps signed-in users off the auth screens. */
function RequireAnon({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  if (authed) return <Navigate to="/clubs" replace />;
  return <>{children}</>;
}

/**
 * HashRouter, not BrowserRouter: the PWA manifest's shortcuts point at
 * `/?source=pwa#/clubs` and `#/reservations`, and those must keep working.
 */
export function App() {
  const { booting } = useAuth();

  // A stored token is being verified — rendering either the app or the sign-in screen now
  // would flash the wrong one.
  if (booting) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <HashRouter>
      {/* Inside the router so a page crash keeps the URL and the reset button usable. */}
      <ErrorBoundary>
        <Routes>
          <Route
            path="/login"
            element={
              <RequireAnon>
                <AuthPage />
              </RequireAnon>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <RequireAnon>
                <ForgotPasswordPage />
              </RequireAnon>
            }
          />
          {/* The uid/token pair comes from the Django password-reset email. */}
          <Route
            path="/reset-password/:uid/:token"
            element={
              <RequireAnon>
                <ResetPasswordPage />
              </RequireAnon>
            }
          />

          {/* Browsing is public — signing in is only required to book. */}
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/clubs/:id" element={<ClubDetailPage />} />
          <Route path="/courts/:id" element={<CourtDetailPage />} />
          <Route
            path="/reservations"
            element={
              <RequireAuth>
                <ReservationsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            }
          />

          <Route path="/" element={<Navigate to="/clubs" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
}
