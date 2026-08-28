import { apiUrl, httpClient } from '../../../shared/api/httpClient';
import { store } from '../../../shared/storage/store';
import type { RegisterPayload, UpdateUserPayload, User } from '../model/auth.types';

async function getCurrentUser(): Promise<User> {
  if (store.demo) {
    return store.user ?? {
      email: 'demo@matchpoint.bg',
      first_name: 'Demo',
      last_name: 'Player',
      is_staff: store.staff,
    };
  }
  const base = await httpClient.json<User>('/api/v1/auth/user/');
  if (base.pk === undefined) return base;
  try {
    const details = await httpClient.json<User>(`/api/users/${base.pk}/`);
    return { ...base, ...details, pk: base.pk };
  } catch {
    return base;
  }
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
  const tokens = await httpClient.json<{ access: string; refresh: string }>(
    '/api/v1/auth/login/',
    { method: 'POST', noAuth: true, body: JSON.stringify({ email, password }) },
  );
  store.setTokens(tokens.access, tokens.refresh);
  try {
    store.user = await getCurrentUser();
  } catch {
    store.user = { email };
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
  const pk = store.user?.pk ?? (await getCurrentUser()).pk;
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
