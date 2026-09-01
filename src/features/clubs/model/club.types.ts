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
  /** Ordered gallery; the first entry is the lead photo. Absent on the live API today. */
  images?: string[];
  /** Used for directions when present; otherwise the name and address are geocoded by Maps. */
  latitude?: number;
  longitude?: number;
}

export interface OpeningHour {
  pk?: number;
  weekday: Weekday | string;
  opening_hour: string;
  closing_hour: string;
}

export interface Employee {
  first_name?: string;
  last_name?: string;
}
