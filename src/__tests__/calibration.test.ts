/**
 * Unit tests for Bank Calibration & Splitting (calibration.ts)
 */
import { describe, expect, it } from 'vitest';
import {
  calibrateParameters,
  percentileOfSorted,
  splitBankAndValidation,
} from '../lib/calibration';

describe('Calibration & Splitting (calibration.ts)', () => {
  it('computes exact percentiles on known sorted arrays', () => {
    const arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(percentileOfSorted(arr, 0)).toBe(10);
    expect(percentileOfSorted(arr, 100)).toBe(100);
    expect(percentileOfSorted(arr, 50)).toBe(55);
  });

  it('guarantees bank and validation sets are non-overlapping', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const { bank, validation } = splitBankAndValidation(items, 0.7);

    expect(bank.length).toBe(7);
    expect(validation.length).toBe(3);

    const bankSet = new Set(bank);
    for (const v of validation) {
      expect(bankSet.has(v)).toBe(false);
    }
  });

  it('preserves non-overlapping property across multiple split sizes', () => {
    for (let count = 5; count <= 50; count += 5) {
      const items = Array.from({ length: count }, (_, i) => `item-${i}`);
      const { bank, validation } = splitBankAndValidation(items, 0.6);

      const intersection = bank.filter((b) => validation.includes(b));
      expect(intersection.length).toBe(0);
      expect(bank.length + validation.length).toBe(count);
    }
  });

  it('calibrates review (95th) and refer (99th) thresholds appropriately', () => {
    const imageScores = Array.from({ length: 100 }, (_, i) => (i + 1) * 0.02);
    const patchScores = Array.from({ length: 1000 }, (_, i) => (i + 1) * 0.001);
    const laplacians = [20, 25, 30, 35, 40];
    const distances = [0.5, 0.8, 1.1, 1.4];

    const cal = calibrateParameters(imageScores, patchScores, laplacians, distances);

    expect(cal.reviewThreshold).toBeGreaterThan(1.5);
    expect(cal.referThreshold).toBeGreaterThan(cal.reviewThreshold);
    expect(cal.blurLimit).toBeGreaterThan(0);
    expect(cal.oodLimit).toBeGreaterThan(1.4);
    expect(cal.sortedValidationScores.length).toBe(100);
  });

  it('handles empty inputs safely', () => {
    expect(percentileOfSorted([], 50)).toBe(0);
    expect(splitBankAndValidation([]).bank.length).toBe(0);
  });
});
