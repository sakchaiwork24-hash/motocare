import { describe, expect, it } from 'vitest';
import { docStatus, docDaysLabel } from './vaultStatus';

describe('docStatus', () => {
  it('is urgent for negative (overdue) and anything under 30 days', () => {
    expect(docStatus(-5)).toBe('urgent');
    expect(docStatus(0)).toBe('urgent');
    expect(docStatus(29)).toBe('urgent');
  });

  it('is soon between 30 and 74 days', () => {
    expect(docStatus(30)).toBe('soon');
    expect(docStatus(74)).toBe('soon');
  });

  it('is good at 75 days or more', () => {
    expect(docStatus(75)).toBe('good');
    expect(docStatus(400)).toBe('good');
  });
});

describe('docDaysLabel', () => {
  it('formats a positive day count as "Xd LEFT"', () => {
    expect(docDaysLabel(22)).toBe('22d LEFT');
    expect(docDaysLabel(0)).toBe('0d LEFT');
  });

  it('formats a negative day count as the absolute value with "Xd OVER"', () => {
    expect(docDaysLabel(-14)).toBe('14d OVER');
  });
});
