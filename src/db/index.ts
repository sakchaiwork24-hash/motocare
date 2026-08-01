import Dexie, { type EntityTable } from 'dexie';
import type { Bike, Config, Rider, SyncQueueEntry, Mod, Part, RidingProfile } from '../types';
import { seedBikes, seedConfig, seedRider } from './seed';
import { consumption } from '../lib/wear';

export const CONFIG_KEY = 'config';
export const RIDER_KEY = 'rider';

type ConfigRow = Config & { key: typeof CONFIG_KEY };
type RiderRow = Rider & { key: typeof RIDER_KEY };

class MotoCareDb extends Dexie {
  bikes!: EntityTable<Bike, 'id'>;
  config!: EntityTable<ConfigRow, 'key'>;
  rider!: EntityTable<RiderRow, 'key'>;
  _syncQueue!: EntityTable<SyncQueueEntry, 'id'>;

  constructor() {
    super('motocare');
    this.version(1).stores({
      bikes: 'id',
      config: 'key',
      rider: 'key',
      _syncQueue: '++id, table, timestamp',
    });
  }
}

export const db = new MotoCareDb();

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
  await db.bikes.update(id, patch);
}

/** Patches the single config row (e.g. `{ activeBikeId }` on bike switch). */
export async function updateConfig(patch: Partial<Config>): Promise<void> {
  await db.config.update(CONFIG_KEY, patch);
}

/** Appends a mutation to the offline sync queue; a connectivity listener (Phase 2+) flushes it. */
export async function queueMutation(
  table: string,
  op: SyncQueueEntry['op'],
  payload: unknown,
): Promise<void> {
  await db._syncQueue.add({ table, op, payload, timestamp: Date.now() });
}

export async function recordService(
  bikeId: string,
  entry: { partKey: string; odo: number; cost: number; shop: string }
): Promise<void> {
  await db.transaction('rw', db.bikes, async () => {
    const bike = await db.bikes.get(bikeId);
    if (!bike) return;
    const today = new Date().toISOString().slice(0, 10);
    const newOdo = Math.max(bike.odo, entry.odo);
    const part = bike.parts.find(p => p.key === entry.partKey);
    const label = part?.label ?? '';
    const parts = bike.parts.map(p =>
      p.key === entry.partKey ? { ...p, lastOdo: entry.odo, lastDate: today } : p
    );
    const services = [
      { date: today, odo: entry.odo, what: label, shop: entry.shop || 'Self-serviced at home', cost: entry.cost },
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
    if (!bike) return;
    const today = new Date().toISOString().slice(0, 10);
    const prevOdo = bike.fuelLogs[0]?.odo ?? 0;
    const newOdo = Math.max(bike.odo, entry.odo);
    const kmpl = entry.odo > prevOdo
      ? Number(consumption(entry.odo, prevOdo, entry.liters).toFixed(1))
      : bike.kmpl;
    const fuelLogs = [
      { date: today, station: entry.station, liters: entry.liters, thb: entry.thb, odo: entry.odo },
      ...bike.fuelLogs,
    ];
    await db.bikes.update(bikeId, { odo: newOdo, kmpl, fuelLogs });
  });
}

export async function advanceModStage(bikeId: string, modId: string): Promise<void> {
  await db.transaction('rw', db.bikes, async () => {
    const bike = await db.bikes.get(bikeId);
    if (!bike) return;
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
    if (!bike) return;
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
  await db.transaction('rw', db.bikes, async () => {
    const bike = await db.bikes.get(bikeId);
    if (!bike) return;
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
    parts, mods: [], fuelLogs: [], monthly: [], services: [], docs: [], specs: [],
  };

  await db.transaction('rw', db.bikes, db.config, async () => {
    await db.bikes.add(bike);
    await db.config.update(CONFIG_KEY, { activeBikeId: id });
  });
  return id;
}

/** Patches one document's stored scan image, same transactional pattern as the other mutators. */
export async function updateDocScan(bikeId: string, docId: string, blob: Blob): Promise<void> {
  await db.transaction('rw', db.bikes, async () => {
    const bike = await db.bikes.get(bikeId);
    if (!bike) return;
    const docs = bike.docs.map((d) => (d.id === docId ? { ...d, scanBlob: blob } : d));
    await db.bikes.update(bikeId, { docs });
  });
}
