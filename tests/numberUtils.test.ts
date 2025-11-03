import { describe, expect, it } from 'vitest';
import { toNumber } from '../src/server/utils/number';

describe('toNumber', () => {
  it('returns zero for invalid input', () => {
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
    expect(toNumber('abc')).toBe(0);
  });

  it('parses valid numeric input', () => {
    expect(toNumber(42)).toBe(42);
    expect(toNumber('3.14')).toBeCloseTo(3.14);
  });
});
