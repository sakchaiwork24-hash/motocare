import type { PartKey } from '../types';

/**
 * Small, hand-curated reference list of *typical* service intervals by generic product category —
 * not a live/manufacturer database (this app has no backend). Always a prefill starting point,
 * never auto-applied without the user confirming/editing in EditPartProfileSheet.
 */
export type PartCatalogEntry = {
  id: string;
  partKey: PartKey;
  label: string;
  interval: number; // km
  timeIntervalDays?: number;
  note: string;
};

export const PART_CATALOG: PartCatalogEntry[] = [
  { id: 'oil-mineral', partKey: 'oil', label: 'Mineral engine oil', interval: 2000, timeIntervalDays: 90, note: 'Typical guidance — check your bike\'s manual, then edit freely.' },
  { id: 'oil-semi', partKey: 'oil', label: 'Semi-synthetic engine oil', interval: 3000, timeIntervalDays: 120, note: 'Typical guidance — check your bike\'s manual, then edit freely.' },
  { id: 'oil-full', partKey: 'oil', label: 'Fully-synthetic engine oil', interval: 5000, timeIntervalDays: 182, note: 'Typical guidance — check your bike\'s manual, then edit freely.' },

  { id: 'chain-non-oring', partKey: 'chain', label: 'Non-O-ring chain', interval: 500, note: 'Lube/clean interval — typical guidance, edit freely.' },
  { id: 'chain-oring', partKey: 'chain', label: 'O-ring / X-ring chain', interval: 900, note: 'Lube/clean interval — typical guidance, edit freely.' },
  { id: 'chain-belt', partKey: 'chain', label: 'CVT drive belt (scooter)', interval: 10000, note: 'Typical scooter/Vespa-type belt inspection interval — check your manual.' },

  { id: 'brake-organic', partKey: 'brake', label: 'Organic brake pads', interval: 9000, note: 'Typical guidance — check your bike\'s manual, then edit freely.' },
  { id: 'brake-sintered', partKey: 'brake', label: 'Sintered brake pads', interval: 13500, note: 'Typical guidance — check your bike\'s manual, then edit freely.' },

  { id: 'tyre-sport', partKey: 'tyre', label: 'Sport / performance tyre', interval: 12000, timeIntervalDays: 1825, note: 'Also capped at 5 years of age regardless of distance.' },
  { id: 'tyre-touring', partKey: 'tyre', label: 'Touring / commuter tyre', interval: 20000, timeIntervalDays: 1825, note: 'Also capped at 5 years of age regardless of distance.' },

  { id: 'air-paper', partKey: 'air', label: 'Paper air filter', interval: 8000, note: 'Typical guidance — check your bike\'s manual, then edit freely.' },
  { id: 'air-foam', partKey: 'air', label: 'Foam / oiled air filter (washable)', interval: 12000, note: 'Washable — typical guidance, edit freely.' },
];
