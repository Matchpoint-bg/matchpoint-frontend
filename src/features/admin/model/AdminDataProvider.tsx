import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Club, OpeningHour } from '../../clubs';
import type { Court, Price } from '../../courts';
import { INITIAL_ADMIN_CLUBS } from './adminData';
import type { ClubManagerContact, ClubSetup, CreateClubInput } from './admin.types';

interface AdminDataValue {
  clubs: ClubSetup[];
  createClub: (input: CreateClubInput) => number;
  updateClub: (clubId: number, patch: Partial<Club>) => void;
  updateManager: (clubId: number, patch: Partial<ClubManagerContact>) => void;
  addCourt: (clubId: number, court: Omit<Court, 'id' | 'club_id'>) => number;
  updateCourt: (clubId: number, courtId: number, patch: Partial<Court>) => void;
  deleteCourt: (clubId: number, courtId: number) => void;
  setOpeningHours: (clubId: number, rows: OpeningHour[]) => void;
  setPrices: (clubId: number, courtId: number, rows: Price[]) => void;
}

const AdminDataContext = createContext<AdminDataValue | null>(null);

function cloneInitialData(): ClubSetup[] {
  return structuredClone(INITIAL_ADMIN_CLUBS);
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [clubs, setClubs] = useState<ClubSetup[]>(cloneInitialData);
  const nextClubId = useRef(1000);
  const nextCourtId = useRef(10000);

  const changeSetup = useCallback((clubId: number, update: (setup: ClubSetup) => ClubSetup) => {
    setClubs((current) => current.map((setup) => setup.club.id === clubId ? update(setup) : setup));
  }, []);

  const createClub = useCallback(({ club, manager, courts, openingHours }: CreateClubInput) => {
    const id = nextClubId.current++;
    const createdCourts: Court[] = [];
    const pricesByCourt: Record<number, Price[]> = {};
    const timeStart = openingHours.map((row) => row.opening_hour).sort()[0] ?? '08:00';
    const timeEnd = openingHours.map((row) => row.closing_hour).sort().at(-1) ?? '22:00';
    courts.forEach(({ court, pricePerHour }) => {
      const courtId = nextCourtId.current++;
      createdCourts.push({ ...court, id: courtId, club_id: id });
      pricesByCourt[courtId] = [{
        weekday: 'All',
        time_start: timeStart,
        time_end: timeEnd,
        price_per_30_minutes: pricePerHour / 2,
      }];
    });
    setClubs((current) => [...current, {
      club: { ...club, id, status: 'Draft' },
      courts: createdCourts,
      openingHours,
      pricesByCourt,
      manager,
    }]);
    return id;
  }, []);

  const updateClub = useCallback((clubId: number, patch: Partial<Club>) => {
    changeSetup(clubId, (setup) => ({ ...setup, club: { ...setup.club, ...patch } }));
  }, [changeSetup]);

  const updateManager = useCallback((clubId: number, patch: Partial<ClubManagerContact>) => {
    changeSetup(clubId, (setup) => ({ ...setup, manager: { ...setup.manager, ...patch } }));
  }, [changeSetup]);

  const addCourt = useCallback((clubId: number, court: Omit<Court, 'id' | 'club_id'>) => {
    const id = nextCourtId.current++;
    changeSetup(clubId, (setup) => ({ ...setup, courts: [...setup.courts, { ...court, id, club_id: clubId }] }));
    return id;
  }, [changeSetup]);

  const updateCourt = useCallback((clubId: number, courtId: number, patch: Partial<Court>) => {
    changeSetup(clubId, (setup) => ({ ...setup, courts: setup.courts.map((court) => court.id === courtId ? { ...court, ...patch } : court) }));
  }, [changeSetup]);

  const deleteCourt = useCallback((clubId: number, courtId: number) => {
    changeSetup(clubId, (setup) => {
      const pricesByCourt = { ...setup.pricesByCourt };
      delete pricesByCourt[courtId];
      return { ...setup, courts: setup.courts.filter((court) => court.id !== courtId), pricesByCourt };
    });
  }, [changeSetup]);

  const setOpeningHours = useCallback((clubId: number, openingHours: OpeningHour[]) => {
    changeSetup(clubId, (setup) => ({ ...setup, openingHours }));
  }, [changeSetup]);

  const setPrices = useCallback((clubId: number, courtId: number, rows: Price[]) => {
    changeSetup(clubId, (setup) => ({ ...setup, pricesByCourt: { ...setup.pricesByCourt, [courtId]: rows } }));
  }, [changeSetup]);

  const value = useMemo<AdminDataValue>(() => ({
    clubs, createClub, updateClub, updateManager, addCourt, updateCourt,
    deleteCourt, setOpeningHours, setPrices,
  }), [clubs, createClub, updateClub, updateManager, addCourt, updateCourt, deleteCourt, setOpeningHours, setPrices]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData(): AdminDataValue {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData must be used inside <AdminDataProvider>');
  return context;
}
