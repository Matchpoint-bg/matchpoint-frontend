export interface MapDestination {
  address?: string;
  name?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * A Google Maps link for a place we know by coordinates, by address, or only by
 * name. Coordinates win when we have them: an address string alone is ambiguous
 * across cities, and a club name alone is worse.
 */
export function directionsUrl({ address, name, latitude, longitude }: MapDestination): string {
  const query =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? `${latitude},${longitude}`
      : address || name || '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
