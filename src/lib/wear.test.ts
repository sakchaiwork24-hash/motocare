import { describe, expect, it } from 'vitest';
import { seedBikes } from '../db/seed';
import { consumption, docCountdown, healthScore, healthStatus, isValidKmpl, tripEstimate, wear, wearStatusLabel } from './wear';

describe('isValidKmpl', () => {
  it('returns true for valid consumption within range', () => {
    expect(isValidKmpl(8)).toBe(true);
    expect(isValidKmpl(35.5)).toBe(true);
    expect(isValidKmpl(120)).toBe(true);
  });

  it('returns false for values below 8', () => {
    expect(isValidKmpl(7.9)).toBe(false);
    expect(isValidKmpl(0)).toBe(false);
    expect(isValidKmpl(-10)).toBe(false);
  });

  it('returns false for values above 120', () => {
    expect(isValidKmpl(120.1)).toBe(false);
    expect(isValidKmpl(153.8)).toBe(false);
  });

  it('returns false for non-finite numbers', () => {
    expect(isValidKmpl(Infinity)).toBe(false);
    expect(isValidKmpl(-Infinity)).toBe(false);
    expect(isValidKmpl(NaN)).toBe(false);
  });
});

describe('wearStatusLabel', () => {
  it('maps status to correct label', () => {
    expect(wearStatusLabel({ status: 'urgent', rem: 0 })).toBe('OVERDUE');
    expect(wearStatusLabel({ status: 'urgent', rem: -100 })).toBe('OVERDUE');
    expect(wearStatusLabel({ status: 'urgent', rem: 200 })).toBe('URGENT');
    expect(wearStatusLabel({ status: 'soon', rem: 500 })).toBe('SERVICE SOON');
    expect(wearStatusLabel({ status: 'good', rem: 2000 })).toBe('GOOD');
  });
});

const zontes = seedBikes.find((b) => b.id === 'zontes')!;
const part = (key: string) => zontes.parts.find((p) => p.key === key)!;

// Fixed "now" matching this session's date — the Zontes oil/tyre parts now carry
// timeIntervalDays (dual-trigger feature), so these must not silently drift with the real
// wall-clock date the way an un-pinned `new Date()` would.
const NOW = new Date('2026-08-01');

describe('wear', () => {
  it('oil at 6,800 km on urban: 1,200 km remaining, 30%, SERVICE SOON (distance still binds over the 6-month time trigger at this date)', () => {
    const result = wear(part('oil'), zontes, 'urban', NOW);
    expect(result.rem).toBe(1200);
    expect(result.pct).toBe(30);
    expect(result.status).toBe('soon');
    expect(result.triggeredBy).toBe('distance');
  });

  it('chain at 6,800 km on urban: 290 km remaining, 45%, GOOD (not urgent — see plan notes)', () => {
    const result = wear(part('chain'), zontes, 'urban', NOW);
    expect(result.rem).toBe(290);
    expect(result.pct).toBe(45);
    expect(result.status).toBe('good');
    expect(result.triggeredBy).toBe('distance');
  });

  it('rem <= 0 is always urgent regardless of pct', () => {
    const overdue = { ...part('oil'), lastOdo: 0, interval: 1000 };
    const result = wear(overdue, { ...zontes, odo: 5000 }, 'mixed', NOW);
    expect(result.rem).toBeLessThanOrEqual(0);
    expect(result.status).toBe('urgent');
  });

  it('a time trigger wins when its pct is lower than the distance pct (low mileage, long calendar gap)', () => {
    // Oil interval 5000 km, only 100 km ridden since replacement (pctDistance ~98%), but
    // replaced 170 days ago against a 182-day time interval — time is clearly the binding one.
    const staleOil = { ...part('oil'), lastOdo: 6700, interval: 5000, lastDate: '2026-02-12', timeIntervalDays: 182 };
    const result = wear(staleOil, { ...zontes, odo: 6800 }, 'mixed', NOW);
    expect(result.triggeredBy).toBe('time');
    expect(result.remDays).toBe(12); // 182 - 170
    expect(result.pct).toBeLessThan(10);
    expect(result.status).toBe('urgent');
  });

  it('the long-interval "<400km left" distance clause still forces urgent even when time wins the displayed pct (regression for the triggeredBy-gating bug)', () => {
    // iv=2500 (>2000), rem=390 (<400) -> distance-urgent on its own terms. Time's pct (15%) is
    // lower than distance's pct (16%) so time "wins" and is what's reported/displayed, and 15%
    // is deliberately kept >= 14 so this case can't pass merely via the generic `pct < 14` rule —
    // it only passes if the distance-specific clause is evaluated independently of triggeredBy.
    const lastDate = new Date(NOW.getTime() - 170 * 86_400_000).toISOString().slice(0, 10);
    const nearlyDueOil = { ...part('oil'), lastOdo: 4690, interval: 2500, lastDate, timeIntervalDays: 200 };
    const result = wear(nearlyDueOil, { ...zontes, odo: 6800 }, 'mixed', NOW);
    expect(result.rem).toBe(390);
    expect(result.triggeredBy).toBe('time');
    expect(result.pct).toBe(15);
    expect(result.status).toBe('urgent');
  });

  it('skips the time trigger gracefully when lastDate is the "New from dealer" sentinel', () => {
    const neverReplacedTyre = part('tyre'); // lastDate: 'New from dealer', has timeIntervalDays: 1825
    const result = wear(neverReplacedTyre, zontes, 'urban', NOW);
    expect(result.triggeredBy).toBe('distance');
    expect(result.remDays).toBeUndefined();
  });
});

describe('healthScore', () => {
  it('averages all 5 parts to 45 for Zontes at 6,800 km on urban', () => {
    expect(healthScore(zontes, 'urban', NOW)).toBe(45);
  });
});

describe('healthStatus', () => {
  it('maps score to good/soon/urgent at the verified thresholds', () => {
    expect(healthStatus(45)).toBe('soon');
    expect(healthStatus(60)).toBe('good');
    expect(healthStatus(20)).toBe('urgent');
    expect(healthStatus(34)).toBe('urgent');
    expect(healthStatus(35)).toBe('soon');
    expect(healthStatus(54)).toBe('soon');
    expect(healthStatus(55)).toBe('good');
  });
});

describe('tripEstimate', () => {
  it('Pattaya (147 km) on the Zontes at ฿37.50/L', () => {
    const result = tripEstimate(147, zontes, 37.5);
    expect(result.liters).toBeCloseTo(5.158, 3);
    expect(result.cost).toBeCloseTo(193.42, 2);
    expect(result.stops).toBe(0);
  });
});

describe('consumption', () => {
  it('matches the per-fill calc between the two most recent Zontes fuel logs', () => {
    const [latest, previous] = zontes.fuelLogs;
    expect(consumption(latest.odo, previous.odo, latest.liters)).toBeCloseTo(28.27, 2);
  });
});

describe('docCountdown', () => {
  it('counts days from an injected "now" to a doc expiry', () => {
    const tax = zontes.docs.find((d) => d.id === 'tax')!;
    expect(docCountdown(tax.expiry, new Date('2026-07-31'))).toBe(22);
  });

  it('is negative once the expiry date has passed', () => {
    expect(docCountdown('2026-01-01', new Date('2026-07-31'))).toBeLessThan(0);
  });
});
