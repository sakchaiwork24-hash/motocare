import { useState } from 'react';

export type NumericFieldRule = {
  parser: 'int' | 'float';
  /** Empty string is valid (skips all checks below) when false. Defaults to true. */
  required?: boolean;
  /** Inclusive lower bound, e.g. `min: 0` rejects negative numbers. */
  min?: number;
  /** Exclusive lower bound, e.g. `exclusiveMin: 0` requires a value strictly greater than 0. */
  exclusiveMin?: number;
  message: string;
  /** Extra check beyond parsing/range, for rules that depend on other state (e.g. "must not be less than the bike's current odometer"). */
  extra?: (n: number) => string | undefined;
};

export function validateNumericField(value: string, rule: NumericFieldRule): string | undefined {
  if (!value && rule.required === false) return undefined;
  const n = rule.parser === 'int' ? parseInt(value, 10) : parseFloat(value);
  if (isNaN(n)) return rule.message;
  if (rule.min !== undefined && n < rule.min) return rule.message;
  if (rule.exclusiveMin !== undefined && n <= rule.exclusiveMin) return rule.message;
  if (rule.extra) {
    const extraError = rule.extra(n);
    if (extraError) return extraError;
  }
  return undefined;
}

export function useFieldValidation(rule: NumericFieldRule) {
  const [error, setError] = useState<string | undefined>();

  const validate = (value: string): boolean => {
    const err = validateNumericField(value, rule);
    setError(err);
    return !err;
  };

  const reset = () => setError(undefined);

  return { error, validate, reset };
}
