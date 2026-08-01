import { describe, it, expect } from 'vitest';
import { PART_CATALOG } from './partCatalog';
import type { PartKey } from '../types';

describe('PART_CATALOG', () => {
  const partKeys: PartKey[] = ['oil', 'brake', 'chain', 'tyre', 'air'];

  it('has at least one entry for every part type', () => {
    for (const key of partKeys) {
      expect(PART_CATALOG.some((c) => c.partKey === key)).toBe(true);
    }
  });

  it('has positive km intervals for every entry', () => {
    for (const entry of PART_CATALOG) {
      expect(entry.interval).toBeGreaterThan(0);
    }
  });

  it('has unique ids', () => {
    const ids = PART_CATALOG.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
