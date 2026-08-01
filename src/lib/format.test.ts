import { describe, expect, it } from 'vitest';
import { shortDate, partLastDate } from './format';

describe('partLastDate', () => {
  it('returns sentinel value directly', () => {
    expect(partLastDate('New from dealer')).toBe('New from dealer');
  });

  it('formats ISO date as English long date', () => {
    expect(partLastDate('2026-04-14')).toBe('14 Apr 2026');
  });
});

describe('shortDate', () => {
  it('formats an ISO date as an English "day month" short label', () => {
    expect(shortDate('2026-07-19')).toBe('19 Jul');
  });

  it('formats single-digit days without leading zero', () => {
    expect(shortDate('2026-02-02')).toBe('2 Feb');
  });
});
