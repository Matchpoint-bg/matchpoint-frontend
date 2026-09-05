import { LS } from '../shared/storage/store';
import type { Club, Employee, Weekday } from '../features/clubs/model/club.types';
import type { Court, Slot } from '../features/courts/model/court.types';
import type { DemoReservation } from '../features/reservations/model/reservation.types';

/**
 * A stand-in court photo, drawn rather than fetched.
 *
 * Demo mode is meant to run with no backend and no network — pointing these at
 * an image host would make the gallery the one part of it that needs both. The
 * result is a data URI, so it behaves like any other image `src`.
 */
function demoPhoto(sky: string, ground: string, line: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="480" viewBox="0 0 720 480">
<rect width="720" height="480" fill="${sky}"/>
<rect y="150" width="720" height="330" fill="${ground}"/>
<g stroke="${line}" stroke-width="3" fill="none" opacity=".85">
<path d="M120 430 L280 200 L440 200 L600 430 Z"/>
<path d="M170 360 L550 360"/><path d="M215 290 L505 290"/><path d="M360 200 L360 430"/>
</g>
<path d="M60 235 H660" stroke="${line}" stroke-width="5" opacity=".95"/>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const DEMO_PHOTOS = {
  clay: demoPhoto('#9fb8dd', '#c2643c', '#fff'),
  hard: demoPhoto('#8fd3e8', '#2f6fa8', '#fff'),
  grass: demoPhoto('#cfe9ff', '#3f8b46', '#fff'),
  dome: demoPhoto('#2a3340', '#3d5a80', '#e8eef5'),
};

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
      neighbourhood: 'Lozenets',
      address: 'bul. Cherni Vrah 45, Lozenets',
      description: 'Six courts tucked below Vitosha — clay in summer, two covered hard courts year-round.',
      website: 'https://example.com',
      phone: '+35929001122',
      email: 'hello@lozenets.tennis',
      facilities: ['Changing rooms', 'Equipment rental', 'Parking'],
      cancellation_policy: 'Free cancellation up to 12 hours before the booking.',
      payment_methods: ['pay_on_site'],
      latitude: 42.6727,
      longitude: 23.3186,
      starting_price: 14,
      thumbnail_url: DEMO_PHOTOS.clay,
    },
    {
      id: 2,
      name: 'Serdika Sports Park',
      city: 'Sofia',
      neighbourhood: 'Serdika',
      address: 'ul. Iliyensko Shose 12, Serdika',
      description: "The city's biggest complex. Floodlit hard courts open till midnight.",
      website: 'https://example.com',
      phone: '+35929887766',
      email: 'book@serdika.park',
      facilities: ['Changing rooms', 'Showers', 'Parking', 'Cafe'],
      cancellation_policy: 'Free cancellation up to 24 hours before the booking.',
      payment_methods: ['pay_on_site'],
      latitude: 42.7234,
      longitude: 23.3151,
      starting_price: 14,
    },
    {
      id: 3,
      name: 'Vitosha Grass Courts',
      city: 'Sofia',
      neighbourhood: 'Dragalevtsi',
      address: 'Dragalevtsi, foot of Vitosha',
      description: 'A rare set of grass courts. Short season, long waitlist.',
      website: 'https://example.com',
      phone: '+35929334455',
      email: 'grass@vitosha.bg',
      facilities: ['Changing rooms', 'Equipment rental'],
      cancellation_policy: 'Free cancellation up to 24 hours before the booking.',
      payment_methods: ['pay_on_site'],
      latitude: 42.6376,
      longitude: 23.3077,
      starting_price: 20,
      thumbnail_url: DEMO_PHOTOS.grass,
    },
  ],
  courts: [
    { id: 11, club_id: 1, name: 'Court 1 — Centre', sport_type: 'Tennis', surface_type: 'Clay', is_indoor: false, is_lit: true },
    { id: 12, club_id: 1, name: 'Court 2 — Clay', sport_type: 'Tennis', surface_type: 'Clay', is_indoor: false, is_lit: true, image_urls: [DEMO_PHOTOS.clay] },
    { id: 13, club_id: 1, name: 'Court 3 — Indoor Hard', sport_type: 'Tennis', surface_type: 'Hard', is_indoor: true, is_lit: true, image_urls: [DEMO_PHOTOS.hard, DEMO_PHOTOS.dome] },
    { id: 21, club_id: 2, name: 'Arena A', sport_type: 'Tennis', surface_type: 'Hard', is_indoor: false, is_lit: true },
    { id: 22, club_id: 2, name: 'Arena B', sport_type: 'Tennis', surface_type: 'Hard', is_indoor: false, is_lit: true },
    { id: 23, club_id: 2, name: 'Dome (Indoor)', sport_type: 'Tennis', surface_type: 'Hard', is_indoor: true, is_lit: true, image_urls: [DEMO_PHOTOS.dome] },
    { id: 31, club_id: 3, name: 'Lawn 1', sport_type: 'Tennis', surface_type: 'Grass', is_indoor: false, is_lit: false, image_urls: [DEMO_PHOTOS.grass] },
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

  const [openHour, openMinute] = hours[1].split(':').map(Number);
  const [closeHour, closeMinute] = hours[2].split(':').map(Number);
  const openAt = (openHour ?? 0) * 60 + (openMinute ?? 0);
  const closeAt = (closeHour ?? 0) * 60 + (closeMinute ?? 0);
  const booked = new Set(
    demoReservations()
      .filter((reservation) => reservation.court === courtId && reservation.date === date)
      .flatMap((reservation) => reservation.slots),
  );

  const slots: Slot[] = [];
  for (let minuteOfDay = openAt; minuteOfDay < closeAt; minuteOfDay += 30) {
    const hour = Math.floor(minuteOfDay / 60);
    const minute = minuteOfDay % 60;
    const start = new Date(selectedDate);
    start.setHours(hour, minute, 0, 0);
    const end = new Date(start.getTime() + 30 * 60_000);
    const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const isBooked = booked.has(label);
    const peak = hour >= 18 && hour <= 21;
    const price = (peak ? 11 : court.is_indoor ? 9 : 7) + (court.surface_type === 'Grass' ? 3 : 0);

    slots.push({
      start: start.toISOString(),
      end: end.toISOString(),
      available:
        end.getTime() > Date.now() && seeded(`${courtId}|${date}|${label}`) > 0.34 && !isBooked,
      status:
        end.getTime() <= Date.now()
          ? 'past'
          : isBooked
            ? 'booked'
            : seeded(`${courtId}|${date}|${label}`) > 0.34
              ? 'available'
              : 'closed',
      price,
      currency: 'BGN',
      unavailable_reason: isBooked ? 'Already booked' : undefined,
      _booked: isBooked,
      _t: label,
    });
  }
  return slots;
}
