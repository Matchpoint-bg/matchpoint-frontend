import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { ClubsPage } from './pages/ClubsPage';
import { ClubDetailPage } from './pages/ClubDetailPage';
import { CourtDetailPage } from './pages/CourtDetailPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { useAuth } from './context/AuthContext';

/**
 * HashRouter, not BrowserRouter: the PWA manifest's shortcuts point at
 * `/?source=pwa#/clubs` and `#/reservations`, and those must keep working.
 */
export function App() {
  const { authed } = useAuth();

  if (!authed) return <AuthPage />;

  return (
    <HashRouter>
      <Routes>
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/clubs/:id" element={<ClubDetailPage />} />
        <Route path="/courts/:id" element={<CourtDetailPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/clubs" replace />} />
      </Routes>
    </HashRouter>
  );
}
