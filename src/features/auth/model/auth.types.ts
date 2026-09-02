export interface User {
  pk?: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  preferred_language?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_admin?: boolean;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  preferred_language?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}
