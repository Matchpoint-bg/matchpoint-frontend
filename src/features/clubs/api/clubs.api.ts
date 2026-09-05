import { DEMO } from '../../../demo/demoData';
import { httpClient } from '../../../shared/api/httpClient';
import { store } from '../../../shared/storage/store';
import { type ApiCourt, toCourt } from '../../courts/api/courts.api';
import type { Court } from '../../courts/model/court.types';
import type { Club, ClubListParams, Employee, OpeningHour } from '../model/club.types';

/** What `ClubListSerializer` adds on top of the shared `Club` fields. */
interface ApiClub extends Club {
  header_image?: string | null;
}

/**
 * The list serializer calls the club photo `header_image`; the UI calls it
 * `thumbnail_url`. One rename, applied wherever a club crosses the boundary.
 */
function toClub(club: ApiClub): Club {
  const { header_image, ...rest } = club;
  return header_image ? { ...rest, thumbnail_url: header_image } : rest;
}

/**
 * `ClubListSerializer` carries `header_image`, but `ClubSerializer` and
 * `ExternalClubSerializer` — the two the detail route picks between — do not, so
 * `GET /api/clubs/{id}/` can never tell us a club's photo. Read it off the list
 * instead, narrowed by the name we just fetched.
 *
 * Delete this whole function once the field is added to the detail serializers;
 * `get` then needs nothing but the `toClub` it already applies.
 */
async function withListHeaderImage(club: Club): Promise<Club> {
  if (club.thumbnail_url || !club.name) return club;
  try {
    const matches = await httpClient.json<ApiClub[]>(
      `/api/clubs/?name=${encodeURIComponent(club.name)}`,
    );
    const listed = matches.find((match) => match.id === club.id);
    return listed?.header_image ? { ...club, thumbnail_url: listed.header_image } : club;
  } catch {
    // A club without its photo still renders; the placeholder covers it.
    return club;
  }
}

/**
 * `ClubFilter`'s `city` is an exact match and `sport`/`surface` are choice fields,
 * so they only accept the API's own capitalisation ("Sofia", "Tennis", "Clay").
 * A lower-cased value from the URL is rejected with a 400 rather than ignored.
 */
function apiCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function listQuery(params: ClubListParams): string {
  const search = new URLSearchParams();
  if (params.name) search.set('name', params.name);
  if (params.city) search.set('city', apiCase(params.city));
  if (params.sport) search.set('sport', apiCase(params.sport));
  if (params.surface) search.set('surface', apiCase(params.surface));
  // Keeps clubs that still have a free slot on the searched date. The backend
  // walks every court's grid to answer this, so only send it when asked for.
  if (params.date) search.set('date', params.date);
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const clubsApi = {
  list: async (params: ClubListParams = {}): Promise<Club[]> => {
    if (store.demo) return DEMO.clubs;
    const clubs = await httpClient.json<ApiClub[]>(`/api/clubs/${listQuery(params)}`);
    // The queryset has no ordering, so Postgres is free to return the rows in any
    // order it likes — and does. Sort here so the list does not reshuffle between
    // refetches.
    return clubs.map(toClub).sort((a, b) => a.name.localeCompare(b.name));
  },

  get: async (id: number): Promise<Club | null> =>
    store.demo
      ? (DEMO.clubs.find((club) => club.id === id) ?? null)
      : withListHeaderImage(toClub(await httpClient.json<ApiClub>(`/api/clubs/${id}/`))),

  courts: async (id: number): Promise<Court[]> =>
    store.demo
      ? DEMO.courts.filter((court) => court.club_id === id)
      : (await httpClient.json<ApiCourt[]>(`/api/clubs/${id}/courts/`)).map(toCourt),

  openingHours: async (id: number): Promise<OpeningHour[]> =>
    store.demo
      ? (DEMO.openingHours[id] || []).map((row, index) => ({
          pk: index + 1,
          weekday: row[0],
          opening_hour: row[1],
          closing_hour: row[2],
        }))
      : httpClient.json<OpeningHour[]>(`/api/clubs/${id}/opening-hours/`),

  employees: async (id: number): Promise<Employee[]> =>
    store.demo
      ? DEMO.employees[id] || []
      : httpClient.json<Employee[]>(`/api/clubs/${id}/employees/`),

  update: async (id: number, body: Partial<Club>): Promise<void> => {
    if (store.demo) {
      const club = DEMO.clubs.find((item) => item.id === id);
      if (club) Object.assign(club, body);
      return;
    }
    await httpClient.json(`/api/clubs/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  /**
   * Replaces the club's single header image. There is one photo per club, so a
   * second upload overwrites the first rather than adding to a gallery.
   *
   * Answers `202` with a bare string, not the stored URL, so callers have to
   * refetch the club to see the result.
   */
  uploadHeaderImage: async (clubId: number, file: File): Promise<void> => {
    if (store.demo) {
      const club = DEMO.clubs.find((item) => item.id === clubId);
      if (club) club.thumbnail_url = URL.createObjectURL(file);
      return;
    }
    const body = new FormData();
    body.append('header_image', file);
    await httpClient.json(`/api/clubs/${clubId}/image/`, { method: 'POST', body });
  },

  addOpeningHour: async (clubId: number, body: OpeningHour): Promise<void> => {
    if (store.demo) {
      const hours = (DEMO.openingHours[clubId] = DEMO.openingHours[clubId] || []);
      hours.push([body.weekday, body.opening_hour, body.closing_hour]);
      return;
    }
    await httpClient.json(`/api/clubs/${clubId}/opening-hours/`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  updateOpeningHour: async (
    pk: number,
    clubId: number,
    body: OpeningHour,
  ): Promise<void> => {
    if (store.demo) {
      const row = DEMO.openingHours[clubId]?.find((item) => item[0] === body.weekday);
      if (row) {
        row[1] = body.opening_hour;
        row[2] = body.closing_hour;
      }
      return;
    }
    await httpClient.json(`/api/openinghours/${pk}/`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  deleteOpeningHour: async (
    pk: number,
    clubId: number,
    weekday: string,
  ): Promise<void> => {
    if (store.demo) {
      const hours = DEMO.openingHours[clubId];
      const index = hours?.findIndex((row) => row[0] === weekday) ?? -1;
      if (hours && index > -1) hours.splice(index, 1);
      return;
    }
    await httpClient.json(`/api/openinghours/${pk}/`, { method: 'DELETE' });
  },
};
