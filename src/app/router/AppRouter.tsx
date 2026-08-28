import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from '../../shared/ui/ErrorBoundary';
import { AuthPage } from '../../pages/auth';
import { ClubDetailsPage } from '../../pages/club-details';
import { ClubsPage } from '../../pages/clubs';
import { CourtDetailsPage } from '../../pages/court-details';
import { ForgotPasswordPage } from '../../pages/forgot-password';
import { NotFoundPage } from '../../pages/not-found';
import { ProfilePage } from '../../pages/profile';
import { ReservationsPage } from '../../pages/reservations';
import { ResetPasswordPage } from '../../pages/reset-password';
import { SettingsPage } from '../../pages/settings';
import { RequireAnon, RequireAuth } from './RouteGuards';

export function AppRouter() {
  return (
    <HashRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<RequireAnon><AuthPage /></RequireAnon>} />
          <Route path="/forgot-password" element={<RequireAnon><ForgotPasswordPage /></RequireAnon>} />
          <Route path="/reset-password/:uid/:token" element={<RequireAnon><ResetPasswordPage /></RequireAnon>} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/clubs/:id" element={<ClubDetailsPage />} />
          <Route path="/courts/:id" element={<CourtDetailsPage />} />
          <Route path="/reservations" element={<RequireAuth><ReservationsPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
          <Route path="/" element={<Navigate to="/clubs" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
}
