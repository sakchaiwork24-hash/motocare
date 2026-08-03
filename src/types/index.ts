export type RidingProfile = 'urban' | 'mixed' | 'touring';

export type PartKey = 'oil' | 'brake' | 'chain' | 'tyre' | 'air';

export type Part = {
  key: PartKey;
  label: string;
  thai: string;
  icon: string;
  interval: number;
  lastOdo: number;
  lastDate: string; // ISO date, or "New from dealer" for never-replaced parts
  prof: boolean; // whether riding-profile factor applies to this part's interval
  timeIntervalDays?: number; // calendar-age trigger alongside the km interval (oil, tyre); undefined = km-only
};

export type ModCategory = 'HANDLING' | 'STYLE' | 'PERFORMANCE' | 'PROTECTION' | 'UTILITY';
export type ModStage = 'wishlist' | 'ordered' | 'installed';

export type Mod = {
  id: string;
  name: string;
  cat: ModCategory;
  price: number;
  stage: ModStage;
  stock: string; // original stock part storage location, always present
  trigger: string; // maintenance-trigger warning copy, empty string when none
  meta: string; // stage-dependent meta line (saved/ordered/installed date + detail)
};

export type FuelLog = {
  date: string; // ISO date
  station: string;
  liters: number;
  thb: number;
  odo: number;
};

export type MonthlySpend = {
  m: string; // 3-letter month label, e.g. "JUL"
  thb: number;
  y?: number; // full year; absent on legacy/seed entries, always set by rollMonthlySpend
};

export type Service = {
  date: string; // ISO date
  odo: number;
  what: string;
  shop: string;
  cost: number;
  receiptBlob?: Blob; // real compressed receipt photo, absent until the user picks one
};

export type TripLog = {
  date: string; // ISO date
  label: string; // matched preset name, or a generic "กำหนดเอง" for a custom distance
  km: number;
  liters: number;
  cost: number;
};

export type DocId = 'tax' | 'prb' | 'vol' | 'lic';

export type Doc = {
  id: DocId;
  name: string;
  thai: string;
  expiry: string; // ISO date
  issuer: string;
  icon: string;
  scanBlob?: Blob; // real compressed scan image, absent until the user picks one
};

export type Bike = {
  id: string;
  nick: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  odo: number;
  kmpl: number;
  tank: number;
  drive: 'Chain' | 'Belt' | 'Shaft';
  photoSize: string; // legacy seed display string; superseded by photoBlob once a real photo is picked
  photoBlob?: Blob; // real compressed cover photo, absent until the user picks one
  profile: RidingProfile; // per-bike, not global — BUILD_PLAN State Management note
  parts: Part[];
  mods: Mod[];
  fuelLogs: FuelLog[];
  monthly: MonthlySpend[];
  services: Service[];
  docs: Doc[];
  specs: [string, string][];
  trips?: TripLog[]; // optional — bikes saved before this field existed simply have none yet
};

export type RiderContact = {
  name: string;
  rel: string;
  phone: string;
  tel: string;
};

export type Rider = {
  name: string;
  nameTh: string;
  blood: string;
  allergies: string;
  notes: string;
  insurer: string;
  policy: string;
  cls: string;
  hospital: string;
  contacts: RiderContact[];
};

export type Config = {
  fuelPricePerLitre: number;
  fuelPriceSyncedAt?: string;
  defaultProfile: RidingProfile; // used when a new bike is added
  bilingualThai: boolean;
  activeBikeId: string;
  installPromptDismissedAt?: string; // ISO date; re-shown after RESHOW_COOLDOWN_DAYS
  lastBackupAt?: string; // ISO date; set whenever an export actually succeeds
  backupReminderDismissedAt?: string; // ISO date; snoozes the reminder banner
  wearNotifiedDate?: string; // ISO date (day-granularity); dedupes the on-open wear notification to once/day
};
