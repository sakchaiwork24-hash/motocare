import { db, CONFIG_KEY, RIDER_KEY } from '../db';
import type { Bike, Config, Rider, Doc, Service } from '../types';

const BACKUP_VERSION = 1;

type SerializedDoc = Omit<Doc, 'scanBlob'> & { scanBlob?: string };
type SerializedService = Omit<Service, 'receiptBlob'> & { receiptBlob?: string };
type SerializedBike = Omit<Bike, 'photoBlob' | 'docs' | 'services'> & {
  photoBlob?: string;
  docs: SerializedDoc[];
  services: SerializedService[];
};

type BackupPayload = {
  version: number;
  exportedAt: string;
  bikes: SerializedBike[];
  config?: Config;
  rider?: Rider;
};

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** Restricts blob fields to actual `data:` URLs — without this, a crafted backup file with
 * `scanBlob: "https://attacker.example/x"` would make `dataUrlToBlob`'s `fetch()` issue a real
 * outbound network request during import instead of just failing safely. */
function isDataUrl(v: unknown): boolean {
  return typeof v === 'string' && v.startsWith('data:');
}

function isValidPart(p: unknown): boolean {
  if (!isRecord(p)) return false;
  return typeof p.key === 'string' && typeof p.interval === 'number' &&
    typeof p.lastOdo === 'number' && typeof p.lastDate === 'string';
}

function isValidFuelLog(f: unknown): boolean {
  if (!isRecord(f)) return false;
  return typeof f.date === 'string' && typeof f.liters === 'number' &&
    typeof f.thb === 'number' && typeof f.odo === 'number';
}

function isValidService(s: unknown): boolean {
  if (!isRecord(s)) return false;
  return typeof s.date === 'string' && typeof s.odo === 'number' && typeof s.cost === 'number' &&
    (s.receiptBlob === undefined || isDataUrl(s.receiptBlob));
}

function isValidMod(m: unknown): boolean {
  if (!isRecord(m)) return false;
  return typeof m.id === 'string' && typeof m.stage === 'string';
}

function isValidSerializedDoc(d: unknown): boolean {
  if (!isRecord(d)) return false;
  return typeof d.id === 'string' && typeof d.expiry === 'string' &&
    (d.scanBlob === undefined || isDataUrl(d.scanBlob));
}

function isValidSerializedBike(b: unknown): b is SerializedBike {
  if (!isRecord(b)) return false;
  return (
    typeof b.id === 'string' &&
    typeof b.nick === 'string' &&
    typeof b.odo === 'number' &&
    typeof b.kmpl === 'number' &&
    typeof b.tank === 'number' &&
    (b.photoBlob === undefined || isDataUrl(b.photoBlob)) &&
    Array.isArray(b.parts) && b.parts.every(isValidPart) &&
    Array.isArray(b.fuelLogs) && b.fuelLogs.every(isValidFuelLog) &&
    Array.isArray(b.services) && b.services.every(isValidService) &&
    Array.isArray(b.mods) && b.mods.every(isValidMod) &&
    Array.isArray(b.docs) && b.docs.every(isValidSerializedDoc)
  );
}

function isValidConfig(c: unknown): c is Config {
  if (!isRecord(c)) return false;
  return typeof c.fuelPricePerLitre === 'number' &&
    typeof c.defaultProfile === 'string' &&
    typeof c.activeBikeId === 'string';
}

function isValidRider(r: unknown): r is Rider {
  if (!isRecord(r)) return false;
  return typeof r.name === 'string' && Array.isArray(r.contacts);
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  if (!dataUrl.startsWith('data:')) {
    throw new Error('Expected a data: URL');
  }
  const res = await fetch(dataUrl);
  return res.blob();
}

async function serializeBike(bike: Bike): Promise<SerializedBike> {
  const { photoBlob, docs, services, ...rest } = bike;
  const serializedDocs: SerializedDoc[] = await Promise.all(
    docs.map(async (doc) => {
      const { scanBlob, ...docRest } = doc;
      return scanBlob ? { ...docRest, scanBlob: await blobToDataUrl(scanBlob) } : { ...docRest };
    })
  );
  const serializedServices: SerializedService[] = await Promise.all(
    services.map(async (service) => {
      const { receiptBlob, ...serviceRest } = service;
      return receiptBlob ? { ...serviceRest, receiptBlob: await blobToDataUrl(receiptBlob) } : { ...serviceRest };
    })
  );
  return {
    ...rest,
    docs: serializedDocs,
    services: serializedServices,
    ...(photoBlob ? { photoBlob: await blobToDataUrl(photoBlob) } : {}),
  };
}

async function deserializeBike(bike: SerializedBike): Promise<Bike> {
  const { photoBlob, docs, services, ...rest } = bike;
  const deserializedDocs: Doc[] = await Promise.all(
    docs.map(async (doc) => {
      const { scanBlob, ...docRest } = doc;
      return scanBlob ? { ...docRest, scanBlob: await dataUrlToBlob(scanBlob) } : { ...docRest };
    })
  );
  const deserializedServices: Service[] = await Promise.all(
    services.map(async (service) => {
      const { receiptBlob, ...serviceRest } = service;
      return receiptBlob ? { ...serviceRest, receiptBlob: await dataUrlToBlob(receiptBlob) } : { ...serviceRest };
    })
  );
  return {
    ...rest,
    docs: deserializedDocs,
    services: deserializedServices,
    ...(photoBlob ? { photoBlob: await dataUrlToBlob(photoBlob) } : {}),
  };
}

/** Serializes every Dexie table to a downloadable JSON file (blobs base64-encoded). */
export async function exportAllData(): Promise<void> {
  const [bikes, config, rider] = await Promise.all([
    db.bikes.toArray(),
    db.config.get(CONFIG_KEY),
    db.rider.get(RIDER_KEY),
  ]);

  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    bikes: await Promise.all(bikes.map(serializeBike)),
    config,
    rider,
  };

  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `motocare-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Restores a backup file, replacing all current data. Runs inside one transaction so a
 * malformed file or a mid-import failure leaves existing data untouched rather than half-restored.
 */
export async function importData(json: string): Promise<void> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('ไฟล์ไม่ถูกต้อง — ไม่สามารถอ่านเป็น JSON ได้');
  }

  const payload = parsed as Partial<BackupPayload>;
  if (typeof payload.version !== 'number' || !Array.isArray(payload.bikes)) {
    throw new Error('ไฟล์ไม่ใช่ไฟล์สำรองข้อมูลของ MotoCare');
  }
  if (payload.version > BACKUP_VERSION) {
    throw new Error('ไฟล์นี้มาจากแอปเวอร์ชันใหม่กว่า — กรุณาอัปเดตแอปก่อนกู้คืน');
  }
  if (!payload.bikes.every(isValidSerializedBike)) {
    throw new Error('ข้อมูลรถในไฟล์สำรองไม่ถูกต้อง — ไฟล์อาจเสียหายหรือถูกแก้ไข');
  }
  if (payload.config !== undefined && !isValidConfig(payload.config)) {
    throw new Error('ข้อมูลตั้งค่าในไฟล์สำรองไม่ถูกต้อง — ไฟล์อาจเสียหายหรือถูกแก้ไข');
  }
  if (payload.rider !== undefined && !isValidRider(payload.rider)) {
    throw new Error('ข้อมูลผู้ขับขี่ในไฟล์สำรองไม่ถูกต้อง — ไฟล์อาจเสียหายหรือถูกแก้ไข');
  }

  const bikes = await Promise.all(payload.bikes.map(deserializeBike));

  await db.transaction('rw', db.bikes, db.config, db.rider, async () => {
    await db.bikes.clear();
    await db.bikes.bulkAdd(bikes);

    await db.config.clear();
    if (payload.config) await db.config.put({ ...payload.config, key: CONFIG_KEY });

    await db.rider.clear();
    if (payload.rider) await db.rider.put({ ...payload.rider, key: RIDER_KEY });
  });
}
