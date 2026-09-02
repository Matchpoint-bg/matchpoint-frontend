import { useMemo, useState } from 'react';
import { DEMO } from '../../../demo/demoData';
import type { Club } from './club.types';

export interface ClubCourtSummary {
  count: number;
  surfaces: string[];
  sports: string[];
  indoorCount: number;
  outdoorCount: number;
}

export interface ClubFilterCriteria {
  query?: string;
  city?: string;
  sport?: string;
  surface?: string | null;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('en');
}

export function useClubFilters(
  clubs: Club[],
  demo: boolean,
  criteria: ClubFilterCriteria = {},
) {
  const [query, setQuery] = useState('');
  const [surface, setSurface] = useState<string | null>(null);
  const effectiveQuery = criteria.query ?? query;
  const effectiveSurface = criteria.surface !== undefined ? criteria.surface : surface;
  const city = criteria.city;
  const sport = criteria.sport;

  const courtsByClub = useMemo(() => {
    const summaries = new Map<number, ClubCourtSummary>();
    if (!demo) return summaries;

    clubs.forEach((club) => {
      const courts = DEMO.courts.filter((court) => court.club_id === club.id);
      summaries.set(club.id, {
        count: courts.length,
        surfaces: [...new Set(courts.map((court) => court.surface_type))],
        sports: [...new Set(courts.map((court) => court.sport_type))],
        indoorCount: courts.filter((court) => court.is_indoor).length,
        outdoorCount: courts.filter((court) => !court.is_indoor).length,
      });
    });
    return summaries;
  }, [clubs, demo]);

  const surfaceOptions = useMemo(
    () => [...new Set([...courtsByClub.values()].flatMap((value) => value.surfaces))].sort(),
    [courtsByClub],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(effectiveQuery);
    const normalizedCity = city ? normalize(city) : '';
    const normalizedSport = sport ? normalize(sport) : '';
    return clubs.filter((club) => {
      const searchable = [club.name, club.city, club.address, club.description]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('en');
      const summary = courtsByClub.get(club.id);
      if (normalizedQuery && !searchable.includes(normalizedQuery)) return false;
      if (normalizedCity && club.city && normalize(club.city) !== normalizedCity) return false;
      if (
        normalizedSport &&
        summary?.sports.length &&
        !summary.sports.some((item) => normalize(item) === normalizedSport)
      ) return false;
      if (effectiveSurface && !summary?.surfaces.includes(effectiveSurface)) return false;
      return true;
    });
  }, [city, clubs, courtsByClub, effectiveQuery, effectiveSurface, sport]);

  return {
    query: effectiveQuery,
    setQuery,
    surface: effectiveSurface,
    setSurface,
    surfaceOptions,
    courtsByClub,
    filtered,
    clear: () => {
      setQuery('');
      setSurface(null);
    },
  };
}
