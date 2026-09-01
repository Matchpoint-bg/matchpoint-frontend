import type { Club } from './club.types';

/**
 * A directions link for the club (ToDoRedesign §9). Coordinates are used when the
 * API sends them; otherwise Maps geocodes the club name plus its address, which is
 * accurate enough for a named venue and works with the data we have today.
 *
 * Returns `null` when there is nothing to point at, so the caller can skip the action.
 */
export function mapsDirectionsUrl(club: Club): string | null {
  const destination =
    typeof club.latitude === 'number' && typeof club.longitude === 'number'
      ? `${club.latitude},${club.longitude}`
      : club.address || club.city
        ? `${club.name}, ${club.address || club.city}`
        : null;

  if (!destination) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
