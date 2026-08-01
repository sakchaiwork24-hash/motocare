import { describe, it, expect } from 'vitest';
import { isValidFuelPrice } from './fuelPriceSync';

describe('isValidFuelPrice', () => {
  it('returns true for valid prices within range', () => {
    expect(isValidFuelPrice(20)).toBe(true);
    expect(isValidFuelPrice(35.5)).toBe(true);
    expect(isValidFuelPrice(100)).toBe(true);
  });

  it('returns false for prices below 20', () => {
    expect(isValidFuelPrice(19.9)).toBe(false);
    expect(isValidFuelPrice(0)).toBe(false);
    expect(isValidFuelPrice(-10)).toBe(false);
  });

  it('returns false for prices above 100', () => {
    expect(isValidFuelPrice(100.1)).toBe(false);
    expect(isValidFuelPrice(200)).toBe(false);
  });

  it('returns false for non-finite numbers', () => {
    expect(isValidFuelPrice(Infinity)).toBe(false);
    expect(isValidFuelPrice(-Infinity)).toBe(false);
    expect(isValidFuelPrice(NaN)).toBe(false);
  });
});
