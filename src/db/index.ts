import Dexie, { type EntityTable } from 'dexie';
import type { Bike, Config, Rider, Mod, Part, RidingProfile, TripLog, Service, FuelLog } from '../types';
import { seedBikes, seedConfig, seedRider } from './seed';
import { consumption, isValidKmpl } from '../lib/wear';

export const CONFIG_KEY = 'config';
export const RIDER_KEY = 'rider';

type ConfigRow = Config & { key: typeof CONFIG_KEY };
type RiderRow = Rider & { key: typeof RIDER_KEY };

class MotoCareDb extends Dexie {
  bikes!: EntityTable<Bike, 'id'>;
  config!: EntityTable<ConfigRow, 'key'>;
  rider!: EntityTable<RiderRow, 'key'>;

  constructor() {
    super('motocare');
    this.version(1).stores({
      bikes: 'id',
      config: 'key',
      rider: 'key',
    });
  }
}

export const db = new MotoCareDb();

/**
 * One-time repair for bikes saved before Service/FuelLog/TripLog had an `id` field: without one,
 * React list keys collide and — more importantly — updateService/deleteService (and the fuel/trip
 * equivalents) look up records by `id`, so every pre-existing entry without one would silently
 * resolve to the same "first item with no id" match instead of the one the user actually tapped.
 * Runs on every app start (cheap no-op once everything has an id); real users can have data from
 * before this feature shipped, unlike `seedIfEmpty` which is dev-only.
 */
export async function backfillMissingIds(): Promise<void> {
  await db.transaction('rw', db.bikes, async () => {
    const bikes = await db.bikes.toArray();
    for (const bike of bikes) {
      const withId = <T extends { id?: string }>(item: T) => (item.id ? item : { ...item, id: crypto.randomUUID() });
      const services = bike.services.map(withId);
      const fuelLogs = bike.fuelLogs.map(withId);
      const trips = bike.trips?.map(withId);
      const changed = services.some((s, i) => s !== bike.services[i])
        || fuelLogs.some((f, i) => f !== bike.fuelLogs[i])
        || (trips && bike.trips && trips.some((t, i) => t !== bike.trips![i]));
      if (changed) {
        await db.bikes.update(bike.id, { services, fuelLogs, ...(trips ? { trips } : {}) });
      }
    }
  });
}

/**
 * Populates the local-first store with the prototype fixture on first run. The empty-check and
 * the writes happen inside one transaction so two concurrent callers (React StrictMode's
 * double-effect-invoke in dev, or multiple tabs sharing the same IndexedDB) can't both see an
 * empty table and both attempt to insert — Dexie serializes transactions on the same tables, so
 * the second caller's count check runs after the first's writes have committed.
 */
export async function seedIfEmpty(): Promise<void> {
  await db.transaction('rw', db.bikes, db.config, db.rider, async () => {
    const bikeCount = await db.bikes.count();
    if (bikeCount > 0) return;

    await db.bikes.bulkAdd(seedBikes);
    await db.config.put({ ...seedConfig, key: CONFIG_KEY });
    await db.rider.put({ ...seedRider, key: RIDER_KEY });
  });
}

/** Patches one bike record (e.g. `{ photoBlob }` after a cover-photo pick). */
export async function updateBike(id: string, patch: Partial<Bike>): Promise<void> {
  const count = await db.bikes.update(id, patch);
  if (count === 0) throw new Error('Bike not found');
}

/** Patches the single config row (e.g. `{ activeBikeId }` on bike switch). */
export async function updateConfig(patch: Partial<Config>): Promise<void> {
  const count = await db.config.update(CONFIG_KEY, patch);
  if (count === 0) throw new Error('Config not found');
}

/**
 * Deletes a bike and all of its service/fuel/trip/doc history with it (there's no separate
 * per-record cleanup needed since those all live nested inside the bike record itself). If the
 * deleted bike was the active one, switches to whichever bike happens to be first in whatever's
 * left, or clears `activeBikeId` entirely if none remain — dropping to zero bikes is already a
 * real, supported state (every fresh production install starts there; `Header.tsx` renders an
 * "Add your first bike" prompt for it).
 */
export async function deleteBike(bikeId: string): Promise<void> {
  await db.transaction('rw', db.bikes, db.config, async () => {
    await db.bikes.delete(bikeId);
    const config = await db.config.get(CONFIG_KEY);
    if (config?.activeBikeId !== bikeId) return;
    const remaining = await db.bikes.toArray();
    await db.config.update(CONFIG_KEY, { activeBikeId: remaining[0]?.id });
  });
}

/**
 * Full factory reset — wipes every bike (and their nested history), config, and rider profile.
 * Reproduces exactly the state a genuine fresh install starts in (`seedIfEmpty()` only seeds in
 * DEV mode, so production always starts empty like this), not a new/untested code path. Callers
 * should strongly encourage exporting a backup first — this has no undo.
 */
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.bikes, db.config, db.rider, async () => {
    await db.bikes.clear();
    await db.config.clear();
    await db.rider.clear();
  });
}

export async function recordService(
  bikeId: string,
  entry: { partKey: string; odo: number; cost: number; shop: string; receiptBlob?: Blob }
): Promise<void> {
  await db.transaction('rw', db.bikes, async () => {
    const bike = await db.bikes.get(bikeId);
    if (!bike) throw new Error('Bike not found');
    const today = new Date().toISOString().slice(0, 10);
    const newOdo = Math.max(bike.odo, entry.odo);
    const part = bike.parts.find(p => p.key === entry.partKey);
    const label = part?.label ?? '';
    const parts = bike.parts.map(p =>
      p.key === entry.partKey ? { ...p, lastOdo: Math.max(p.lastOdo, entry.odo), lastDate: today } : p
    );
    const services = [
      {
        id: crypto.randomUUID(),
        date: today, odo: entry.odo, what: label, shop: entry.shop || 'Self-serviced at home', cost: entry.cost,
        ...(entry.receiptBlob ? { receiptBlob: entry.receiptBlob } : {}),
      },
      ...bike.services,
    ];
    await db.bikes.update(bikeId, { odo: newOdo, parts, services });
  });
}

export async function recordFuelLog(
  bikeId: string,
  entry: { liters: number; thb: number; odo: number; station: string }
): Promise<void> {
  await db.transaction('rw', db.bikes, async () => {
    const bike = await db.bikes.get(bikeId);
    if (!bike) throw new Error('Bike not found');
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const hasPriorLog = bike.fuelLogs.length > 0;
    const prevOdo = bike.fuelLogs[0]?.odo ?? entry.odo;
    const newOdo = Math.max(bike.odo, entry.odo);
    const computedKmpl = hasPriorLog && entry.odo > prevOdo
      ? Number(consumption(entry.odo, prevOdo, entry.liters).toFixed(1))
      : null;
    const kmpl = computedKmpl !== null && isValidKmpl(computedKmpl) ? computedKmpl : bike.kmpl;
    const fuelLogs = [
      { id: crypto.randomUUID(), date: today, station: entry.station, liters: entry.liters, thb: entry.thb, odo: entry.odo },
      ...bike.fuelLogs,
    ];
    await db.bikes.update(bikeId, { odo: newOdo, kmpl, fuelLogs });
  });
}

export async function recordTrip(
  bikeId: string,
  entry: Omit<TripLog, 'date' | 'id'>
): Promise<void> {
  await db.transaction('rw', db.bikes, async () => {
    const bike = await db.bikes.get(bikeId);
    if (!bike) throw new Error('Bike not found');
    const today = new Date().toISOString().slice(0, 10);
    const trips = [{ id: crypto.randomUUID(), date: today, ...entry }, ...(bike.trips ?? [])];
    await db.bikes.update(bikeId, { trips });
  });
}

export async function advanceModStage(bikeId: string, modId: string): Promise<void> {
  await db.transaction('rw', db.bikes, async () => {
    const bike = await db.bikes.get(bikeId);
    if (!bike) throw new Error('Bike not found');
    const modIndex = bike.mods.findIndex(m => m.id === modId);
    if (modIndex < 0) return;
    const mod = bike.mods[modIndex];
    if (mod.stage === 'installed') return;
    
    const next = mod.stage === 'wishlist' ? 'ordered' : 'installed';
    const meta = next === 'ordered'
      ? 'Ordered today · ETA 5–7 days'
      : `Installed today @ ${bike.odo.toLocaleString()} km`;
      
    const newMods = [...bike.mods];
    newMods[modIndex] = { ...mod, stage: next, meta };
    await db.bikes.update(bikeId, { mods: newMods });
  });
}

export async function upsertMod(bikeId: string, mod: Mod): Promise<void> {
  await db.transaction('rw', db.bikes, async () => {
    const bike = await db.bikes.get(bikeId);
    if (!bike) throw new Error('Bike not found');
    const existingIndex = bike.mods.findIndex(m => m.id === mod.id);
    const newMods = [...bike.mods];
    if (existingIndex >= 0) {
      newMods[existingIndex] = mod;
    } else {
      newMods.unshift(mod);
    }
    await db.bikes.update(bikeId, { mods: newMods });
  });
}

/**
 * Edits a part's schedule definition (label/interval/timeIntervalDays) — deliberately separate
 * from `recordService`, which only bumps `lastOdo`/`lastDate` when a replacement is logged.
 */
export async function updatePartProfile(
  bikeId: string,
  partKey: string,
  patch: { label: string; thai: string; interval: number; timeIntervalDays?: number },
): Promise<void> {
  if (patch.interval <= 0 || (patch.timeIntervalDays !== undefined && patch.timeIntervalDays <= 0)) {
    throw new Error('Interval must be positive');
  }
  await db.transaction('rw', db.bikes, async () => {
    const bike = await db.bikes.get(bikeId);
    if (!bike) throw new Error('Bike not found');
    const parts = bike.parts.map((p) =>
      p.key === partKey ? { ...p, ...patch } : p
    );
    await db.bikes.update(bikeId, { parts });
  });
}

/**
 * Creates a new bike with sensible starter defaults and makes it the active bike. The 5 wear
 * parts always exist (there's no "add a part" UI, wear cards are always exactly these 5 keys) —
 * `lastOdo`/`lastDate` are set to "just serviced today" so a freshly-added bike doesn't show as
 * immediately overdue; the user can refine any part's schedule right away via
 * `updatePartProfile`/`EditPartProfileSheet`. `docs` starts empty rather than with fake expiry
 * dates — there's no "edit expiry" UI to fix a placeholder value later.
 */
export async function addBike(input: {
  nick: string; brand: string; model: string; year: number; plate: string;
  odo: number; kmpl: number; tank: number; drive: 'Chain' | 'Belt' | 'Shaft'; profile: RidingProfile;
}): Promise<string> {
  const id = crypto.randomUUID();
  const today = new Date().toISOString().slice(0, 10);
  const chainLabel = input.drive === 'Belt' ? 'Drive Belt + Rollers'
    : input.drive === 'Shaft' ? 'Shaft Drive Gear Oil'
    : 'Chain Lube & Tension';
  const chainThai = input.drive === 'Belt' ? 'สายพาน + เม็ดตุ้ม'
    : input.drive === 'Shaft' ? 'เปลี่ยนน้ำมันเฟืองท้าย'
    : 'โซ่ · หล่อลื่น/ตั้งระยะ';
  const chainInterval = input.drive === 'Shaft' ? 20000 : 900;

  const parts: Part[] = [
    { key: 'oil', label: 'Engine Oil', thai: 'น้ำมันเครื่อง', icon: '#ic-drop', interval: 3000, lastOdo: input.odo, lastDate: today, prof: true, timeIntervalDays: 120 },
    { key: 'brake', label: 'Brake Pads', thai: 'ผ้าเบรก', icon: '#ic-disc', interval: 10000, lastOdo: input.odo, lastDate: today, prof: true },
    { key: 'chain', label: chainLabel, thai: chainThai, icon: '#ic-chain', interval: chainInterval, lastOdo: input.odo, lastDate: today, prof: true },
    { key: 'tyre', label: 'Tyres (Front / Rear)', thai: 'ยางหน้า/หลัง', icon: '#ic-tyre', interval: 18000, lastOdo: input.odo, lastDate: today, prof: false, timeIntervalDays: 1825 },
    { key: 'air', label: 'Air Filter', thai: 'ไส้กรองอากาศ', icon: '#ic-box', interval: 8000, lastOdo: input.odo, lastDate: today, prof: true },
  ];

  const bike: Bike = {
    id, nick: input.nick, brand: input.brand, model: input.model, year: input.year,
    plate: input.plate, odo: input.odo, kmpl: input.kmpl, tank: input.tank, drive: input.drive,
    photoSize: '', profile: input.profile,
    parts, mods: [], fuelLogs: [], services: [], docs: [], specs: [], trips: [],
  };

  await db.transaction('rw', db.bikes, db.config, async () => {
    await db.bikes.add(bike);
    const existingConfig = await db.config.get(CONFIG_KEY);
    await db.config.put({
      fuelPricePerLitre: 37.5,
      defaultProfile: 'urban',
      bilingualThai: true,
      ...existingConfig,
      activeBikeId: id,
      key: CONFIG_KEY,
    });
  });
  return id;
}

/** Patches one document's stored scan image, same transactional pattern as the other mutators. */
export async function updateDocScan(bikeId: string, docId: string, blob: Blob): Promise<void> {
  await db.transaction('rw', db.bikes, async () => {
    const bike = await db.bikes.get(bikeId);
    if (!bike) throw new Error('Bike not found');
    const docs = bike.docs.map((d) => (d.id === docId ? { ...d, scanBlob: blob } : d));
    await db.bikes.update(bikeId, { docs });
  });
}

/**
 * Shared "find bike, replace/remove one item in one of its list fields" shape used by the
 * update/delete mutators below for services, fuelLogs, and trips — `updater` returning `null`
 * deletes the item, otherwise the returned value replaces it in place. `extraPatch`, when given,
 * lets a caller fold extra bike-level fields into the same atomic update (e.g. keeping `bike.odo`
 * in sync when an edited record's odo goes higher) — it only runs on update, never on delete.
 */
async function patchBikeList<T extends { id: string }>(
  bikeId: string,
  key: 'services' | 'fuelLogs' | 'trips',
  itemId: string,
  updater: (item: T) => T | null,
  extraPatch?: (updated: T, bike: Bike) => Partial<Bike>
): Promise<void> {
  await db.transaction('rw', db.bikes, async () => {
    const bike = await db.bikes.get(bikeId);
    if (!bike) throw new Error('Bike not found');
    const list = (bike[key] as T[] | undefined) ?? [];
    const index = list.findIndex((item) => item.id === itemId);
    if (index < 0) throw new Error('Record not found');
    const updated = updater(list[index]);
    const newList = updated === null
      ? list.filter((_, i) => i !== index)
      : list.map((item, i) => (i === index ? updated : item));
    const patch: Partial<Bike> = { [key]: newList } as Partial<Bike>;
    if (updated !== null && extraPatch) {
      Object.assign(patch, extraPatch(updated, bike));
    }
    await db.bikes.update(bikeId, patch);
  });
}

/**
 * Keeps `bike.odo` — the value every wear/health calculation reads — in sync when an edit
 * raises a record's odo above the bike's currently-known reading. `recordService`/`recordFuelLog`
 * already do this on create via the same `Math.max`; edits went through `patchBikeList` alone and
 * silently left `bike.odo` stale until the next new entry happened to be logged.
 */
const syncOdo = <T extends { odo: number }>(updated: T, bike: Bike): Partial<Bike> => ({
  odo: Math.max(bike.odo, updated.odo),
});

export async function updateService(bikeId: string, serviceId: string, patch: Omit<Service, 'id'>): Promise<void> {
  await patchBikeList<Service>(bikeId, 'services', serviceId, (item) => ({ ...patch, id: item.id }), syncOdo);
}

export async function deleteService(bikeId: string, serviceId: string): Promise<void> {
  await patchBikeList<Service>(bikeId, 'services', serviceId, () => null);
}

export async function updateFuelLog(bikeId: string, fuelLogId: string, patch: Omit<FuelLog, 'id'>): Promise<void> {
  await patchBikeList<FuelLog>(bikeId, 'fuelLogs', fuelLogId, (item) => ({ ...patch, id: item.id }), syncOdo);
}

export async function deleteFuelLog(bikeId: string, fuelLogId: string): Promise<void> {
  await patchBikeList<FuelLog>(bikeId, 'fuelLogs', fuelLogId, () => null);
}

export async function deleteTrip(bikeId: string, tripId: string): Promise<void> {
  await patchBikeList<TripLog>(bikeId, 'trips', tripId, () => null);
}
