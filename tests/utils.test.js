import { describe, it, expect } from 'vitest';
import { validateDimension, validateQuality } from '../api/_utils.js';

describe('validateDimension', () => {
  it('accepts valid dimensions', () => {
    expect(validateDimension('100', 'Width')).toBe(100);
    expect(validateDimension('1', 'Width')).toBe(1);
    expect(validateDimension('16384', 'Height')).toBe(16384);
  });

  it('rejects zero', () => {
    expect(() => validateDimension('0', 'Width')).toThrow('Width must be between 1 and 16384');
  });

  it('rejects negative values', () => {
    expect(() => validateDimension('-10', 'Width')).toThrow('Width must be between 1 and 16384');
  });

  it('rejects values over 16384', () => {
    expect(() => validateDimension('20000', 'Height')).toThrow('Height must be between 1 and 16384');
  });

  it('rejects non-numeric strings', () => {
    expect(() => validateDimension('abc', 'Width')).toThrow('Width must be between 1 and 16384');
  });
});

describe('validateQuality', () => {
  it('accepts valid quality values', () => {
    expect(validateQuality('1')).toBe(1);
    expect(validateQuality('80')).toBe(80);
    expect(validateQuality('100')).toBe(100);
  });

  it('rejects zero', () => {
    expect(() => validateQuality('0')).toThrow('Quality must be between 1 and 100');
  });

  it('rejects values over 100', () => {
    expect(() => validateQuality('101')).toThrow('Quality must be between 1 and 100');
  });

  it('rejects non-numeric strings', () => {
    expect(() => validateQuality('high')).toThrow('Quality must be between 1 and 100');
  });
});
