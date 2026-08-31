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
  neighbourhood?: string;
  address?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  thumbnail_url?: string;
  gallery_urls?: string[];
  facilities?: string[];
  cancellation_policy?: string;
  payment_methods?: Array<'pay_on_site' | 'online' | string>;
  latitude?: number;
  longitude?: number;
  starting_price?: number;
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
