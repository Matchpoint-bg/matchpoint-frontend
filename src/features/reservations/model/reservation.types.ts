export interface Reservation {
  id: number;
  court: number;
  start_datetime: string;
  end_datetime: string;
  reservation_amt?: number;
}

export interface CreateReservationBody {
  court: number;
  start_datetime: string;
  end_datetime: string;
}

export interface DemoReservation {
  id: number;
  court: number;
  start: string;
  end: string;
  amt: number;
  date: string;
  slots: string[];
}

export interface DemoReservationMeta {
  amt: number;
  date: string;
}
