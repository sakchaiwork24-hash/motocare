import Dexie, { type EntityTable } from 'dexie';
import type { Bike, Config, Rider, Mod, Part, RidingProfile, TripLog } from '../types';
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

export async function recordService(
  bikeId: string,
  entry: { partKey: string; odo: number; cost: number; shop: string }
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
      { date: today, odo: entry.odo, what: label, shop: entry.shop || 'Self-serviced at home', cost: entry.cost },
      ...bike.services,
    ];
    await db.bikes.update(bikeId, { odo: newOdo, parts, services });
  });
}

const MONTHLY_WINDOW = 6;

/** Rolls a fuel spend into the trailing 6-month window shown by StatGrid/MonthlyBars — bumps
 * the current month's total if it's already the last entry, otherwise appends a new month and
 * drops the oldest so the window never grows past MONTHLY_WINDOW. */
function rollMonthlySpend(monthly: Bike['monthly'], thb: number, now: Date): Bike['monthly'] {
  const label = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const year = now.getFullYear();
  const last = monthly[monthly.length - 1];
  // `last.y` is only set by this function (legacy/seed entries carry no year) — only bump the
  // existing bucket when the year is known and actually matches, so a same-named month from a
  // prior year (e.g. a 12-month gap between fuel logs) can't silently merge into a stale bucket.
  if (last && last.m === label && last.y === year) {
    return [...monthly.slice(0, -1), { m: label, thb: last.thb + thb, y: year }];
  }
  const next = [...monthly, { m: label, thb, y: year }];
  return next.length > MONTHLY_WINDOW ? next.slice(next.length - MONTHLY_WINDOW) : next;
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
      { date: today, station: entry.station, liters: entry.liters, thb: entry.thb, odo: entry.odo },
      ...bike.fuelLogs,
    ];
    const monthly = rollMonthlySpend(bike.monthly, entry.thb, now);
    await db.bikes.update(bikeId, { odo: newOdo, kmpl, fuelLogs, monthly });
  });
}

export async function recordTrip(
  bikeId: string,
  entry: Omit<TripLog, 'date'>
): Promise<void> {
  await db.transaction('rw', db.bikes, async () => {
    const bike = await db.bikes.get(bikeId);
    if (!bike) throw new Error('Bike not found');
    const today = new Date().toISOString().slice(0, 10);
    const trips = [{ date: today, ...entry }, ...(bike.trips ?? [])];
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
    parts, mods: [], fuelLogs: [], monthly: [], services: [], docs: [], specs: [], trips: [],
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
