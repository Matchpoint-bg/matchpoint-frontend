/** Shapes returned by the MatchPoint Django REST backend (and mirrored by the demo data). */

export type Surface = 'Clay' | 'Grass' | 'Hard';

export type Weekday =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface Club {
  id: number;
  name: string;
  city?: string;
  address?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
}

export interface Court {
  id: number;
  /** Present on demo fixtures; the real serializer may omit it on the detail endpoint. */
  club_id?: number;
  name: string;
  sport_type: string;
  surface_type: Surface | string;
  is_indoor: boolean;
  is_lit: boolean;
}

export interface OpeningHour {
  /** Returned by GET /api/clubs/{id}/opening-hours/; needed to PATCH or DELETE the row. */
  pk?: number;
  weekday: Weekday | string;
  opening_hour: string;
  closing_hour: string;
}

export interface Employee {
  first_name?: string;
  last_name?: string;
}

export interface Price {
  weekday: Weekday | string;
  time_start: string;
  time_end: string;
  price_per_30_minutes: number;
}

export interface Slot {
  start: string;
  end: string;
  available: boolean;
  price: number;
  /** Demo-only: distinguishes "booked by someone" from "club closed". */
  _booked?: boolean;
  /** Demo-only: pre-formatted HH:MM label. */
  _t?: string;
}

export interface Reservation {
  id: number;
  court: number;
  start_datetime: string;
  end_datetime: string;
  reservation_amt?: number;
}

export interface User {
  /** Primary key, returned by /api/v1/auth/user/. Needed to address /api/users/{pk}/. */
  pk?: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  preferred_language?: string;
  /**
   * Staff flags come from the server. The UI uses them to decide what to render; the
   * backend is still the only thing that actually enforces club-management permissions.
   */
  is_staff?: boolean;
  is_superuser?: boolean;
}

/** Fields the profile screen may edit. Email and staff flags are deliberately not here. */
export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  /** The API stores the words "Bulgarian" / "English", not locale codes. */
  preferred_language?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

/** A reservation as persisted in localStorage while in demo mode. */
export interface DemoReservation {
  id: number;
  court: number;
  start: string;
  end: string;
  amt: number;
  date: string;
  slots: string[];
}

export interface CreateReservationBody {
  court: number;
  start_datetime: string;
  end_datetime: string;
}

/**
 * Extra bookkeeping the demo store needs to render a reservation without a server.
 * Passed alongside the body rather than inside it, so nothing demo-shaped can be
 * serialised into a real API request.
 */
export interface DemoReservationMeta {
  amt: number;
  date: string;
}
