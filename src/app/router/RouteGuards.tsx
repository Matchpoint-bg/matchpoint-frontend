import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  const location = useLocation();
  if (!authed) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export function RequireAnon({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  if (authed) return <Navigate to="/clubs" replace />;
  return <>{children}</>;
}
