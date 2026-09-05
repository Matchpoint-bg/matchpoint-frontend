import { store } from '../storage/store';

/**
 * The signed-in user's id, read out of the access token's `user_id` claim.
 *
 * `GET /api/v1/auth/user/` answers with a serializer that exposes no id at all,
 * and `GET /api/users/` is admin-only — so the token is the only place the front
 * end can learn its own primary key, and it needs one to PATCH the profile and to
 * tell its own bookings apart from everyone's. Decoding here is display-side
 * convenience; the API still verifies the signature on every request.
 */
export function currentUserId(token: string | null = store.access): number | undefined {
  const payload = token?.split('.')[1];
  if (!payload) return undefined;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const claims = JSON.parse(atob(padded)) as { user_id?: string | number };
    const id = Number(claims.user_id);
    return Number.isFinite(id) ? id : undefined;
  } catch {
    return undefined;
  }
}
