import { LS } from './store';
import type { Club, Court, DemoReservation, Employee, Slot, Weekday } from '../types';

/**
 * Demo fixtures mirroring the DRF serializers, so the UI is fully usable without a
 * running backend. Toggle off in Settings to hit the real API.
 */
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
      description:
        'Six courts tucked below Vitosha — clay in summer, two covered hard courts year-round.',
      website: 'https://example.com',
      phone: '+35929001122',
      email: 'hello@lozenets.tennis',
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

export function saveDemoReservations(a: DemoReservation[]): void {
  localStorage.setItem(LS.demoRes, JSON.stringify(a));
}

/** Deterministic pseudo-random, so demo availability is stable per court+date+slot. */
export function seeded(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export function courtName(id: number, fallback: string): string {
  const c = DEMO.courts.find((x) => x.id === id);
  return c ? c.name : `${fallback} #${id}`;
}

export function demoAvailability(courtId: number, dateStr: string): Slot[] {
  const court = DEMO.courts.find((c) => c.id === courtId);
  if (!court) return [];
  const club = DEMO.clubs.find((c) => c.id === court.club_id);
  if (!club) return [];

  const d = new Date(`${dateStr}T00:00:00`);
  const wd = WEEKDAY_BY_INDEX[d.getDay()];
  const oh = (DEMO.openingHours[club.id] || []).find((r) => r[0] === wd);
  if (!oh) return [];

  const openHour = Number(oh[1].split(':')[0]);
  const closeHour = Number(oh[2].split(':')[0]);

  const booked = new Set(
    demoReservations()
      .filter((r) => r.court === courtId && r.date === dateStr)
      .flatMap((r) => r.slots),
  );

  const slots: Slot[] = [];
  for (let h = openHour; h < closeHour; h++) {
    for (const m of [0, 30]) {
      const start = new Date(d);
      start.setHours(h, m, 0, 0);
      const end = new Date(start.getTime() + 30 * 60000);
      const hh = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      const peak = h >= 18 && h <= 21;
      const price = (peak ? 11 : court.is_indoor ? 9 : 7) + (court.surface_type === 'Grass' ? 3 : 0);
      const isBooked = booked.has(hh);
      // ~2/3 of slots open, deterministically.
      const available = seeded(`${courtId}|${dateStr}|${hh}`) > 0.34 && !isBooked;

      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
        available,
        price,
        _booked: isBooked,
        _t: hh,
      });
    }
  }
  return slots;
}
