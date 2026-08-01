import { useLiveQuery } from 'dexie-react-hooks';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { CONFIG_KEY, RIDER_KEY, db, seedIfEmpty, updateConfig } from '../db';
import type { Bike, Config, Rider } from '../types';

type BikeContextValue = {
  bikes: Bike[];
  activeBike: Bike | undefined;
  activeId: string | undefined;
  switchBike: (id: string) => void;
  config: Config | undefined;
  rider: Rider | undefined;
  switcherOpen: boolean;
  openSwitcher: () => void;
  closeSwitcher: () => void;
  serviceSheet: { open: boolean; partKey?: string };
  openServiceSheet: (partKey?: string) => void;
  closeServiceSheet: () => void;
  logFuelSheet: { open: boolean };
  openLogFuelSheet: () => void;
  closeLogFuelSheet: () => void;
  flashTrip: boolean;
  triggerTripFlash: () => void;
};

const BikeContext = createContext<BikeContextValue | null>(null);

export function BikeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (import.meta.env.DEV) seedIfEmpty();
  }, []);

  const bikes = useLiveQuery(() => db.bikes.toArray(), [], []) ?? [];
  const config = useLiveQuery(() => db.config.get(CONFIG_KEY), []);
  const rider = useLiveQuery(() => db.rider.get(RIDER_KEY), []);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [serviceSheet, setServiceSheet] = useState<{ open: boolean; partKey?: string }>({ open: false });
  const [logFuelSheet, setLogFuelSheet] = useState<{ open: boolean }>({ open: false });
  const [flashTrip, setFlashTrip] = useState(false);
  const flashTripTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeId = config?.activeBikeId;
  const activeBike = bikes.find((b) => b.id === activeId) ?? bikes[0];

  const switchBike = useCallback((id: string) => {
    void updateConfig({ activeBikeId: id });
  }, []);

  const openSwitcher = useCallback(() => setSwitcherOpen(true), []);
  const closeSwitcher = useCallback(() => setSwitcherOpen(false), []);
  
  const openServiceSheet = useCallback((partKey?: string) => setServiceSheet({ open: true, partKey }), []);
  const closeServiceSheet = useCallback(() => setServiceSheet((prev) => ({ ...prev, open: false })), []);

  const openLogFuelSheet = useCallback(() => setLogFuelSheet({ open: true }), []);
  const closeLogFuelSheet = useCallback(() => setLogFuelSheet({ open: false }), []);

  const triggerTripFlash = useCallback(() => {
    if (flashTripTimeout.current) clearTimeout(flashTripTimeout.current);
    setFlashTrip(true);
    flashTripTimeout.current = setTimeout(() => setFlashTrip(false), 1400);
  }, []);

  return (
    <BikeContext.Provider
      value={{
        bikes, activeBike, activeId, switchBike, config, rider,
        switcherOpen, openSwitcher, closeSwitcher,
        serviceSheet, openServiceSheet, closeServiceSheet,
        logFuelSheet, openLogFuelSheet, closeLogFuelSheet,
        flashTrip, triggerTripFlash
      }}
    >
      {children}
    </BikeContext.Provider>
  );
}

export function useBikes(): BikeContextValue {
  const ctx = useContext(BikeContext);
  if (!ctx) throw new Error('useBikes must be used within a BikeProvider');
  return ctx;
}
