import { useState } from 'react';
import { useClubsQuery } from '../../clubs';
import type { Club } from '../../clubs';
import { store } from '../../../shared/storage/store';

/**
 * The club the operator is currently managing, persisted per device.
 *
 * TODO(club-switcher, ToDoRedesign §7): there is no "clubs I'm staff of"
 * endpoint yet, so this lists *every* club and lets staff pick one. Once the
 * backend exposes membership, only this hook changes — the workspace can then
 * grow a real switcher and auto-scope to a single club.
 */
export function useStaffClub() {
  const clubsQuery = useClubsQuery();
  const [stored, setStored] = useState<number | null>(() => store.staffClub);

  const clubs: Club[] = clubsQuery.data ?? [];
  // A single club needs no picking; a stale stored id (club gone) falls back to
  // "nothing selected" rather than pointing the workspace at a missing club.
  const known = clubs.some((club) => club.id === stored);
  const clubId = known ? stored : clubs.length === 1 ? (clubs[0]?.id ?? null) : null;
  const club = clubs.find((item) => item.id === clubId) ?? null;

  return {
    clubs,
    clubId,
    club,
    isPending: clubsQuery.isPending,
    error: clubsQuery.error,
    refetch: () => void clubsQuery.refetch(),
    setClubId: (value: number | null) => {
      store.staffClub = value;
      setStored(value);
    },
  };
}
