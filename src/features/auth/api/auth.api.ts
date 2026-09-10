import { apiUrl, httpClient } from '../../../shared/api/httpClient';
import { currentUserId } from '../../../shared/api/session';
import { store } from '../../../shared/storage/store';
import type { RegisterPayload, UpdateUserPayload, User } from '../model/auth.types';

interface LoginResponse {
  access: string;
  refresh: string;
  user?: User;
}

function withId(user: User): User {
  const pk = user.pk ?? currentUserId();
  return pk === undefined ? user : { ...user, pk };
}

async function getCurrentUser(): Promise<User> {
  if (store.demo) {
    return store.user ?? {
      email: 'demo@matchpoint.bg',
      first_name: 'Demo',
      last_name: 'Player',
      is_staff: store.staff,
    };
  }
  // `/api/v1/auth/user/` is already backed by `UserSerializer` (REST_AUTH's
  // USER_DETAILS_SERIALIZER), the same one `/api/users/{pk}/` returns, so there is
  // nothing further to fetch.
  return withId(await httpClient.json<User>('/api/v1/auth/user/'));
}

async function login(email: string, password: string): Promise<void> {
  if (store.demo) {
    store.setTokens('demo-access', 'demo-refresh');
    store.user = {
      email,
      first_name: 'Demo',
      last_name: 'Player',
      phone_number: '',
      preferred_language: store.lang === 'bg' ? 'Bulgarian' : 'English',
      is_staff: store.staff,
    };
    return;
  }
  const session = await httpClient.json<LoginResponse>('/api/v1/auth/login/', {
    method: 'POST',
    noAuth: true,
    body: JSON.stringify({ email, password }),
  });
  store.setTokens(session.access, session.refresh);
  // dj-rest-auth returns the user alongside the tokens, so the usual case costs
  // one request. The re-fetch is only for a backend that stops doing that.
  if (session.user) {
    store.user = withId(session.user);
    return;
  }
  try {
    store.user = await getCurrentUser();
  } catch {
    store.user = withId({ email });
  }
}

async function register(payload: RegisterPayload): Promise<void> {
  if (store.demo) {
    store.setTokens('demo-access', 'demo-refresh');
    store.user = {
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name,
      phone_number: payload.phone_number || '',
      preferred_language: store.lang === 'bg' ? 'Bulgarian' : 'English',
      is_staff: store.staff,
    };
    return;
  }
  await httpClient.json('/api/v1/auth/registration/', {
    method: 'POST',
    noAuth: true,
    body: JSON.stringify({
      email: payload.email,
      password1: payload.password,
      password2: payload.password,
      first_name: payload.first_name,
      last_name: payload.last_name,
    }),
  });
  await login(payload.email, payload.password);
}

async function updateUser(payload: UpdateUserPayload): Promise<User> {
  if (store.demo) {
    const user = { ...(store.user ?? { email: 'demo@matchpoint.bg' }), ...payload };
    store.user = user;
    return user;
  }
  const pk = store.user?.pk ?? currentUserId() ?? (await getCurrentUser()).pk;
  if (pk === undefined) throw new Error('Cannot resolve the current user');
  const details = await httpClient.json<User>(`/api/users/${pk}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  const user = { ...(store.user ?? {}), ...details, pk } as User;
  store.user = user;
  return user;
}

export const authApi = {
  getCurrentUser,
  login,
  register,
  updateUser,
  googleUrl: () => apiUrl('/api/v1/auth/google/'),
  changePassword: async (newPassword: string, confirm: string): Promise<void> => {
    if (store.demo) return;
    await httpClient.json('/api/v1/auth/password/change/', {
      method: 'POST',
      body: JSON.stringify({ new_password1: newPassword, new_password2: confirm }),
    });
  },
  requestPasswordReset: async (email: string): Promise<void> => {
    if (store.demo) return;
    await httpClient.json('/api/v1/auth/password/reset/', {
      method: 'POST',
      noAuth: true,
      body: JSON.stringify({ email }),
    });
  },
  confirmPasswordReset: async (
    uid: string,
    token: string,
    newPassword: string,
    confirm: string,
  ): Promise<void> => {
    if (store.demo) return;
    await httpClient.json('/api/v1/auth/password/reset/confirm/', {
      method: 'POST',
      noAuth: true,
      body: JSON.stringify({
        uid,
        token,
        new_password1: newPassword,
        new_password2: confirm,
      }),
    });
  },
};
