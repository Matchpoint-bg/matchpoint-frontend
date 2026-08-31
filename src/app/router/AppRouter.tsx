import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../../shared/ui/ErrorBoundary';
import { AuthPage } from '../../pages/auth';
import { BookingCheckoutPage } from '../../pages/booking-checkout';
import { BookingConfirmationPage } from '../../pages/booking-confirmation';
import { BookingReviewPage } from '../../pages/booking-review';
import {
  ClubBookingsPage,
  ClubCourtsPage,
  ClubOverviewPage,
  ClubSchedulePage,
  ClubSettingsPage,
  ClubTeamPage,
} from '../../pages/club';
import { ClubDetailsPage } from '../../pages/club-details';
import { ClubResultsPage, ClubsPage } from '../../pages/clubs';
import { CourtDetailsPage } from '../../pages/court-details';
import { ForClubsPage } from '../../pages/for-clubs';
import { ForgotPasswordPage } from '../../pages/forgot-password';
import { NotFoundPage } from '../../pages/not-found';
import { ProfilePage } from '../../pages/profile';
import { ReservationsPage } from '../../pages/reservations';
import { ResetPasswordPage } from '../../pages/reset-password';
import { SettingsPage } from '../../pages/settings';
import { ShowcasePage } from '../../pages/showcase';
import { RequireAnon, RequireAuth, RequireStaff } from './RouteGuards';

function LegacyClubsRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/players${search}`} replace />;
}

export function AppRouter() {
  return (
    <HashRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<RequireAnon><AuthPage /></RequireAnon>} />
          <Route path="/forgot-password" element={<RequireAnon><ForgotPasswordPage /></RequireAnon>} />
          <Route path="/reset-password/:uid/:token" element={<RequireAnon><ResetPasswordPage /></RequireAnon>} />
          <Route path="/players" element={<ClubsPage />} />
          <Route path="/search" element={<ClubResultsPage />} />
          <Route path="/clubs" element={<LegacyClubsRedirect />} />
          <Route path="/clubs/:id" element={<ClubDetailsPage />} />
          <Route path="/book/:courtId/review" element={<BookingReviewPage />} />
          <Route path="/book/:courtId/checkout" element={<RequireAuth><BookingCheckoutPage /></RequireAuth>} />
          <Route path="/booking/confirmation/:id" element={<RequireAuth><BookingConfirmationPage /></RequireAuth>} />
          <Route path="/courts/:id" element={<CourtDetailsPage />} />
          <Route path="/for-clubs" element={<ForClubsPage />} />
          <Route path="/reservations" element={<RequireAuth><ReservationsPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
          {/* Club operator workspace — separate IA from the player app (§4). */}
          <Route path="/club" element={<RequireStaff><ClubOverviewPage /></RequireStaff>} />
          <Route path="/club/schedule" element={<RequireStaff><ClubSchedulePage /></RequireStaff>} />
          <Route path="/club/bookings" element={<RequireStaff><ClubBookingsPage /></RequireStaff>} />
          <Route path="/club/courts" element={<RequireStaff><ClubCourtsPage /></RequireStaff>} />
          <Route path="/club/team" element={<RequireStaff><ClubTeamPage /></RequireStaff>} />
          <Route path="/club/settings" element={<RequireStaff><ClubSettingsPage /></RequireStaff>} />
          {/* Dev-only design-system gallery; not registered in production builds. */}
          {import.meta.env.DEV && <Route path="/showcase" element={<ShowcasePage />} />}
          <Route path="/" element={<Navigate to="/players" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
}
