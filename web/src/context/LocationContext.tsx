'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface UserLocation {
  lat: number;
  lon: number;
  label: string;
}

interface LocationContextValue {
  location: UserLocation | null;
  /** User's search radius in miles (how far they're willing to look). */
  radiusMiles: number;
  setLocation: (location: UserLocation) => void;
  clearLocation: () => void;
  setRadius: (radiusMiles: number) => void;
}

const STORAGE_KEY = 'expade:user-location';
const DEFAULT_RADIUS_MILES = 25;

const LocationContext = createContext<LocationContextValue | null>(null);

interface PersistedState {
  location: UserLocation | null;
  radiusMiles: number;
}

function readPersisted(): PersistedState {
  if (typeof window === 'undefined') return { location: null, radiusMiles: DEFAULT_RADIUS_MILES };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { location: null, radiusMiles: DEFAULT_RADIUS_MILES };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      location: parsed.location ?? null,
      radiusMiles: parsed.radiusMiles ?? DEFAULT_RADIUS_MILES,
    };
  } catch {
    return { location: null, radiusMiles: DEFAULT_RADIUS_MILES };
  }
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<UserLocation | null>(null);
  const [radiusMiles, setRadiusState] = useState(DEFAULT_RADIUS_MILES);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    const persisted = readPersisted();
    setLocationState(persisted.location);
    setRadiusState(persisted.radiusMiles);
  }, []);

  // Persist on change.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ location, radiusMiles }));
  }, [location, radiusMiles]);

  const value = useMemo<LocationContextValue>(
    () => ({
      location,
      radiusMiles,
      setLocation: setLocationState,
      clearLocation: () => setLocationState(null),
      setRadius: setRadiusState,
    }),
    [location, radiusMiles],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useUserLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useUserLocation must be used within a LocationProvider');
  return ctx;
}
