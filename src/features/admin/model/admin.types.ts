import type { Club, OpeningHour } from '../../clubs';
import type { Court, Price } from '../../courts';

export interface ClubManagerContact {
  name: string;
  phone: string;
  email: string;
}

export interface NewClubCourt {
  court: Omit<Court, 'id' | 'club_id'>;
  pricePerHour: number;
}

export interface CreateClubInput {
  club: Omit<Club, 'id'>;
  manager: ClubManagerContact;
  courts: NewClubCourt[];
  openingHours: OpeningHour[];
}

/** Admin setup is an aggregate over the existing domain entities, not a second Club model. */
export interface ClubSetup {
  club: Club;
  courts: Court[];
  openingHours: OpeningHour[];
  pricesByCourt: Record<number, Price[]>;
  manager: ClubManagerContact;
}

export interface SetupCheck {
  key: 'information' | 'courts' | 'hours' | 'prices' | 'manager';
  complete: boolean;
}
