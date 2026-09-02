import type { ClubSetup, SetupCheck } from './admin.types';

export const INITIAL_ADMIN_CLUBS: ClubSetup[] = [
  {
    club: {
      id: 901,
      name: 'Arena Tennis Sofia',
      city: 'Sofia',
      address: '15 Bulgaria Blvd',
      description: 'Indoor and outdoor tennis courts near the city centre.',
      phone: '+359 2 555 0101',
      email: 'hello@arenatennis.bg',
      status: 'Active',
      thumbnail_url: '/demo/club-1a.svg',
    },
    courts: [
      { id: 9101, club_id: 901, name: 'Centre Court', sport_type: 'Tennis', surface_type: 'Clay', is_indoor: false, is_lit: true, is_active: true },
      { id: 9102, club_id: 901, name: 'Court 2', sport_type: 'Tennis', surface_type: 'Hard', is_indoor: true, is_lit: true, is_active: true },
    ],
    openingHours: [
      { weekday: 'Monday', opening_hour: '08:00', closing_hour: '22:00' },
      { weekday: 'Tuesday', opening_hour: '08:00', closing_hour: '22:00' },
      { weekday: 'Wednesday', opening_hour: '08:00', closing_hour: '22:00' },
      { weekday: 'Thursday', opening_hour: '08:00', closing_hour: '22:00' },
      { weekday: 'Friday', opening_hour: '08:00', closing_hour: '22:00' },
      { weekday: 'Saturday', opening_hour: '09:00', closing_hour: '21:00' },
      { weekday: 'Sunday', opening_hour: '09:00', closing_hour: '21:00' },
    ],
    pricesByCourt: {
      9101: [{ weekday: 'All', time_start: '08:00', time_end: '22:00', price_per_30_minutes: 15 }],
      9102: [{ weekday: 'All', time_start: '08:00', time_end: '22:00', price_per_30_minutes: 20 }],
    },
    manager: { name: 'Maria Petrova', phone: '+359 888 111 222', email: 'maria@aceclub.bg' },
  },
  {
    club: {
      id: 902,
      name: 'South Park Courts',
      city: 'Sofia',
      address: 'South Park, entrance 3',
      description: 'A new MatchPoint partner currently being configured.',
      email: 'office@southparkcourts.bg',
      status: 'Draft',
      thumbnail_url: '/demo/club-2a.svg',
    },
    courts: [
      { id: 9201, club_id: 902, name: 'Court 1', sport_type: 'Tennis', surface_type: 'Clay', is_indoor: false, is_lit: false, is_active: true },
    ],
    openingHours: [],
    pricesByCourt: {},
    manager: { name: '', phone: '', email: '' },
  },
  {
    club: {
      id: 903,
      name: 'Lozenets Racquet Club',
      city: 'Sofia',
      address: '42 Cherni Vrah Blvd',
      description: 'Neighbourhood racquet club.',
      phone: '+359 2 555 0103',
      email: 'team@lozenetsclub.bg',
      status: 'Inactive',
    },
    courts: [
      { id: 9301, club_id: 903, name: 'Green Court', sport_type: 'Tennis', surface_type: 'Hard', is_indoor: false, is_lit: true, is_active: true },
    ],
    openingHours: [{ weekday: 'Monday', opening_hour: '09:00', closing_hour: '20:00' }],
    pricesByCourt: {
      9301: [{ weekday: 'All', time_start: '09:00', time_end: '20:00', price_per_30_minutes: 14 }],
    },
    manager: { name: 'Elena Georgieva', phone: '+359 888 333 444', email: 'elena@tennispark.bg' },
  },
];

export function setupChecks(setup: ClubSetup): SetupCheck[] {
  const activeCourts = setup.courts.filter((court) => court.is_active !== false);
  return [
    { key: 'information', complete: Boolean(setup.club.name.trim() && (setup.club.address?.trim() || setup.club.city?.trim())) },
    { key: 'courts', complete: activeCourts.length > 0 },
    { key: 'hours', complete: setup.openingHours.some((row) => row.opening_hour < row.closing_hour) },
    { key: 'prices', complete: activeCourts.length > 0 && activeCourts.every((court) => (setup.pricesByCourt[court.id]?.length ?? 0) > 0) },
    { key: 'manager', complete: Boolean(setup.manager.name.trim() && setup.manager.phone.trim() && setup.manager.email.trim()) },
  ];
}
