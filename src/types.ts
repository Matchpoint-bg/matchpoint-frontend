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
  email: string;
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
  /** Demo-only bookkeeping, ignored by the real API. */
  _amt?: number;
  _date?: string;
}
