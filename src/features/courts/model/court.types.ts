import type { Weekday } from '../../clubs/model/club.types';

export type Surface = 'Clay' | 'Grass' | 'Hard';

export interface Court {
  id: number;
  club_id?: number;
  name: string;
  sport_type: string;
  surface_type: Surface | string;
  is_indoor: boolean;
  is_lit: boolean;
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
  /** Preferred API contract. `available` remains while the backend migrates. */
  status?: 'available' | 'booked' | 'held' | 'closed' | 'past';
  price: number;
  currency?: 'BGN' | string;
  unavailable_reason?: string;
  _booked?: boolean;
  _t?: string;
}

export interface Unavailability {
  start_datetime: string;
  end_datetime: string;
}
