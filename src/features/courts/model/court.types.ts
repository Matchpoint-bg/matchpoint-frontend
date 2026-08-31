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

/**
 * Why a slot can or cannot be picked. `selected` is not here on purpose — that
 * is view state the grid owns, not something the slot itself carries.
 */
export type SlotStatus = 'available' | 'booked' | 'held' | 'closed' | 'past';

export interface Slot {
  start: string;
  end: string;
  available: boolean;
  price: number;
  /**
   * Sent by the backend once it models status explicitly. Until then
   * `slotStatus()` derives it from `available`/`_booked` and the clock.
   */
  status?: SlotStatus;
  _booked?: boolean;
  _t?: string;
}

export interface Unavailability {
  start_datetime: string;
  end_datetime: string;
}
