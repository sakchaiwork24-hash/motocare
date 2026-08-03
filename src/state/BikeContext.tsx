import { useLiveQuery } from 'dexie-react-hooks';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { CONFIG_KEY, RIDER_KEY, db, seedIfEmpty, backfillMissingIds, updateConfig } from '../db';
import type { Bike, Config, Rider, Service, FuelLog } from '../types';
import { useToast } from './ToastContext';

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
  serviceSheet: { open: boolean; partKey?: string; editing?: Service };
  openServiceSheet: (partKey?: string) => void;
  openServiceSheetForEdit: (service: Service) => void;
  closeServiceSheet: () => void;
  logFuelSheet: { open: boolean; editing?: FuelLog };
  openLogFuelSheet: () => void;
  openLogFuelSheetForEdit: (log: FuelLog) => void;
  closeLogFuelSheet: () => void;
  backupSheetOpen: boolean;
  openBackupSheet: () => void;
  closeBackupSheet: () => void;
  flashTrip: boolean;
  triggerTripFlash: () => void;
};

const BikeContext = createContext<BikeContextValue | null>(null);

export function BikeProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();

  useEffect(() => {
    if (import.meta.env.DEV) seedIfEmpty();
    backfillMissingIds().catch((err) => console.error('backfillMissingIds failed', err));
  }, []);

  const bikes = useLiveQuery(() => db.bikes.toArray(), [], []) ?? [];
  const config = useLiveQuery(() => db.config.get(CONFIG_KEY), []);
  const rider = useLiveQuery(() => db.rider.get(RIDER_KEY), []);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [serviceSheet, setServiceSheet] = useState<{ open: boolean; partKey?: string; editing?: Service }>({ open: false });
  const [logFuelSheet, setLogFuelSheet] = useState<{ open: boolean; editing?: FuelLog }>({ open: false });
  const [backupSheetOpen, setBackupSheetOpen] = useState(false);
  const [flashTrip, setFlashTrip] = useState(false);
  const flashTripTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeId = config?.activeBikeId;
  const activeBike = bikes.find((b) => b.id === activeId) ?? bikes[0];

  const switchBike = useCallback((id: string) => {
    updateConfig({ activeBikeId: id }).catch((err) => {
      console.error('switchBike failed', err);
      showToast('สลับรถไม่สำเร็จ ลองใหม่อีกครั้ง');
    });
  }, [showToast]);

  const openSwitcher = useCallback(() => setSwitcherOpen(true), []);
  const closeSwitcher = useCallback(() => setSwitcherOpen(false), []);
  
  const openServiceSheet = useCallback((partKey?: string) => setServiceSheet({ open: true, partKey }), []);
  const openServiceSheetForEdit = useCallback((service: Service) => setServiceSheet({ open: true, editing: service }), []);
  const closeServiceSheet = useCallback(() => setServiceSheet((prev) => ({ ...prev, open: false })), []);

  const openLogFuelSheet = useCallback(() => setLogFuelSheet({ open: true }), []);
  const openLogFuelSheetForEdit = useCallback((log: FuelLog) => setLogFuelSheet({ open: true, editing: log }), []);
  const closeLogFuelSheet = useCallback(() => setLogFuelSheet({ open: false }), []);

  const openBackupSheet = useCallback(() => setBackupSheetOpen(true), []);
  const closeBackupSheet = useCallback(() => setBackupSheetOpen(false), []);

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
        serviceSheet, openServiceSheet, openServiceSheetForEdit, closeServiceSheet,
        logFuelSheet, openLogFuelSheet, openLogFuelSheetForEdit, closeLogFuelSheet,
        backupSheetOpen, openBackupSheet, closeBackupSheet,
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
