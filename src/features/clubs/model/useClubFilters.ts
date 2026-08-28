import { useMemo, useState } from 'react';
import { DEMO } from '../../../demo/demoData';
import type { Club } from './club.types';

export interface ClubCourtSummary {
  count: number;
  surfaces: string[];
}

export function useClubFilters(clubs: Club[], demo: boolean) {
  const [query, setQuery] = useState('');
  const [surface, setSurface] = useState<string | null>(null);

  const courtsByClub = useMemo(() => {
    const summaries = new Map<number, ClubCourtSummary>();
    if (!demo) return summaries;

    clubs.forEach((club) => {
      const courts = DEMO.courts.filter((court) => court.club_id === club.id);
      summaries.set(club.id, {
        count: courts.length,
        surfaces: [...new Set(courts.map((court) => court.surface_type))],
      });
    });
    return summaries;
  }, [clubs, demo]);

  const surfaceOptions = useMemo(
    () => [...new Set([...courtsByClub.values()].flatMap((value) => value.surfaces))].sort(),
    [courtsByClub],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return clubs.filter((club) => {
      const searchable = [club.name, club.city, club.address, club.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (normalizedQuery && !searchable.includes(normalizedQuery)) return false;
      if (surface && !courtsByClub.get(club.id)?.surfaces.includes(surface)) return false;
      return true;
    });
  }, [clubs, courtsByClub, query, surface]);

  return {
    query,
    setQuery,
    surface,
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
