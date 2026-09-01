import { LS } from '../shared/storage/store';
import type { Club, Employee, Weekday } from '../features/clubs/model/club.types';
import type { Court, Slot } from '../features/courts/model/court.types';
import type { DemoReservation } from '../features/reservations/model/reservation.types';

/** Demo photos ship with the app, so demo mode keeps working offline. */
const photo = (name: string) => `${import.meta.env.BASE_URL}demo/${name}.svg`;

export const DEMO: {
  clubs: Club[];
  courts: Court[];
  openingHours: Record<number, [string, string, string][]>;
  employees: Record<number, Employee[]>;
} = {
  clubs: [
    {
      id: 1,
      name: 'Lozenets Tennis Club',
      city: 'Sofia',
      address: 'bul. Cherni Vrah 45, Lozenets',
      description: 'Six courts tucked below Vitosha — clay in summer, two covered hard courts year-round.',
      website: 'https://example.com',
      phone: '+35929001122',
      email: 'hello@lozenets.tennis',
      images: [photo('club-1a'), photo('club-1b'), photo('club-1c')],
      latitude: 42.6624,
      longitude: 23.3211,
    },
    {
      id: 2,
      name: 'Serdika Sports Park',
      city: 'Sofia',
      address: 'ul. Iliyensko Shose 12, Serdika',
      description: "The city's biggest complex. Floodlit hard courts open till midnight.",
      website: 'https://example.com',
      phone: '+35929887766',
      email: 'book@serdika.park',
      images: [photo('club-2a')],
    },
    {
      id: 3,
      name: 'Vitosha Grass Courts',
      city: 'Sofia',
      address: 'Dragalevtsi, foot of Vitosha',
      description: 'A rare set of grass courts. Short season, long waitlist.',
      website: 'https://example.com',
      phone: '+35929334455',
      email: 'grass@vitosha.bg',
    },
  ],
  courts: [
    { id: 11, club_id: 1, name: 'Court 1 — Centre', sport_type: 'Tennis', surface_type: 'Clay', is_indoor: false, is_lit: true },
    { id: 12, club_id: 1, name: 'Court 2 — Clay', sport_type: 'Tennis', surface_type: 'Clay', is_indoor: false, is_lit: true },
    { id: 13, club_id: 1, name: 'Court 3 — Indoor Hard', sport_type: 'Tennis', surface_type: 'Hard', is_indoor: true, is_lit: true },
    { id: 21, club_id: 2, name: 'Arena A', sport_type: 'Tennis', surface_type: 'Hard', is_indoor: false, is_lit: true },
    { id: 22, club_id: 2, name: 'Arena B', sport_type: 'Tennis', surface_type: 'Hard', is_indoor: false, is_lit: true },
    { id: 23, club_id: 2, name: 'Dome (Indoor)', sport_type: 'Tennis', surface_type: 'Hard', is_indoor: true, is_lit: true },
    { id: 31, club_id: 3, name: 'Lawn 1', sport_type: 'Tennis', surface_type: 'Grass', is_indoor: false, is_lit: false },
    { id: 32, club_id: 3, name: 'Lawn 2', sport_type: 'Tennis', surface_type: 'Grass', is_indoor: false, is_lit: false },
  ],
  openingHours: {
    1: [
      ['Monday', '08:00', '22:00'], ['Tuesday', '08:00', '22:00'], ['Wednesday', '08:00', '22:00'],
      ['Thursday', '08:00', '22:00'], ['Friday', '08:00', '23:00'], ['Saturday', '08:00', '21:00'],
      ['Sunday', '09:00', '20:00'],
    ],
    2: [
      ['Monday', '07:00', '23:30'], ['Tuesday', '07:00', '23:30'], ['Wednesday', '07:00', '23:30'],
      ['Thursday', '07:00', '23:30'], ['Friday', '07:00', '23:30'], ['Saturday', '08:00', '23:30'],
      ['Sunday', '08:00', '22:00'],
    ],
    3: [
      ['Monday', '09:00', '19:00'], ['Wednesday', '09:00', '19:00'], ['Friday', '09:00', '19:00'],
      ['Saturday', '09:00', '18:00'], ['Sunday', '09:00', '18:00'],
    ],
  },
  employees: {
    1: [{ first_name: 'Ivana', last_name: 'Petrova' }, { first_name: 'Georgi', last_name: 'Dimitrov' }],
    2: [{ first_name: 'Maria', last_name: 'Koleva' }],
    3: [{ first_name: 'Stefan', last_name: 'Iliev' }],
  },
};

const WEEKDAY_BY_INDEX: Weekday[] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export function demoReservations(): DemoReservation[] {
  try {
    return JSON.parse(localStorage.getItem(LS.demoRes) || '[]') as DemoReservation[];
  } catch {
    return [];
  }
}

export function saveDemoReservations(reservations: DemoReservation[]): void {
  localStorage.setItem(LS.demoRes, JSON.stringify(reservations));
}

function seeded(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000) / 1000;
}

export function demoAvailability(courtId: number, date: string): Slot[] {
  const court = DEMO.courts.find((item) => item.id === courtId);
  if (!court) return [];
  const club = DEMO.clubs.find((item) => item.id === court.club_id);
  if (!club) return [];

  const selectedDate = new Date(`${date}T00:00:00`);
  const weekday = WEEKDAY_BY_INDEX[selectedDate.getDay()];
  const hours = (DEMO.openingHours[club.id] || []).find((row) => row[0] === weekday);
  if (!hours) return [];

  const openHour = Number(hours[1].split(':')[0]);
  const closeHour = Number(hours[2].split(':')[0]);
  const booked = new Set(
    demoReservations()
      .filter((reservation) => reservation.court === courtId && reservation.date === date)
      .flatMap((reservation) => reservation.slots),
  );

  const slots: Slot[] = [];
  for (let hour = openHour; hour < closeHour; hour++) {
    for (const minute of [0, 30]) {
      const start = new Date(selectedDate);
      start.setHours(hour, minute, 0, 0);
      const end = new Date(start.getTime() + 30 * 60_000);
      const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const isBooked = booked.has(label);
      const peak = hour >= 18 && hour <= 21;
      const price = (peak ? 11 : court.is_indoor ? 9 : 7) + (court.surface_type === 'Grass' ? 3 : 0);
      const roll = seeded(`${courtId}|${date}|${label}`);
      const free = roll > 0.34 && !isBooked;
      // A thin slice of free slots sits in someone else's checkout, so the demo
      // can show the `held` state alongside the rest.
      const held = free && roll > 0.34 && roll < 0.39;

      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
        available: free && !held,
        price,
        ...(held ? { status: 'held' as const } : {}),
        _booked: isBooked,
        _t: label,
      });
    }
  }
  return slots;
}
