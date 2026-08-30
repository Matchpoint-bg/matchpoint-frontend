import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  const location = useLocation();
  if (!authed) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

/**
 * Club workspace guard. Anonymous visitors go to login (so they land back here
 * after signing in); signed-in players are sent to the marketplace — the
 * workspace is not a page they can browse into.
 */
export function RequireStaff({ children }: { children: ReactNode }) {
  const { authed, isStaff } = useAuth();
  const location = useLocation();
  if (!authed) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isStaff) return <Navigate to="/players" replace />;
  return <>{children}</>;
}

export function RequireAnon({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  if (authed) return <Navigate to="/players" replace />;
  return <>{children}</>;
}
