/**
 * Unit tests for Calibrated Verdict and Borderline calculation (verdict.ts)
 */
import { describe, expect, it } from 'vitest';
import {
  calculatePercentile,
  computeVerdict,
  isNearThreshold,
  VerdictThresholds,
} from '../lib/verdict';

describe('Calibrated Verdict Calculation (verdict.ts)', () => {
  const thresholds: VerdictThresholds = {
    reviewThreshold: 1.0,
    referThreshold: 1.5,
  };

  const validationScores = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0];

  it('assigns Normal verdict when score is below review threshold', () => {
    const res = computeVerdict(0.5, thresholds, validationScores);
    expect(res.label).toBe('Normal');
    expect(res.borderline).toBe(false);
    expect(res.explanation).toContain('expected healthy range');
  });

  it('assigns Review verdict when score is between review and refer thresholds', () => {
    const res = computeVerdict(1.25, thresholds, validationScores);
    expect(res.label).toBe('Review');
    expect(res.borderline).toBe(false);
    expect(res.explanation).toContain('moderate deviation');
  });

  it('assigns Refer verdict when score is at or above refer threshold', () => {
    const res = computeVerdict(1.8, thresholds, validationScores);
    expect(res.label).toBe('Refer');
    expect(res.borderline).toBe(false);
    expect(res.explanation).toContain('marked deviation');
  });

  it('identifies borderline scores within 5% of Review threshold', () => {
    // 1.0 * 0.05 = 0.05. Score 0.98 is within 0.02 of 1.0
    const res = computeVerdict(0.98, thresholds, validationScores, 0.05);
    expect(res.label).toBe('Normal');
    expect(res.borderline).toBe(true);
    expect(res.explanation).toContain('Borderline');
  });

  it('identifies borderline scores within 5% of Refer threshold', () => {
    // 1.5 * 0.05 = 0.075. Score 1.48 is within 0.02 of 1.5
    const res = computeVerdict(1.48, thresholds, validationScores, 0.05);
    expect(res.label).toBe('Review');
    expect(res.borderline).toBe(true);
  });

  it('computes empirical percentile accurately against validation array', () => {
    // 3 items below 0.7 out of 10 items = 30%
    const pct = calculatePercentile(0.7, validationScores);
    expect(pct).toBe(30);
  });

  it('handles empty validation score array safely', () => {
    const pct = calculatePercentile(1.2, []);
    expect(pct).toBe(50);
  });

  it('enforces percentile monotonicity property', () => {
    // For any non-decreasing score, percentile must be non-decreasing
    let prevPct = -1;
    for (let s = 0; s <= 2.5; s += 0.1) {
      const pct = calculatePercentile(s, validationScores);
      expect(pct).toBeGreaterThanOrEqual(prevPct);
      prevPct = pct;
    }
  });

  it('checks threshold proximity safely with non-positive values', () => {
    expect(isNearThreshold(0.5, 0)).toBe(false);
    expect(isNearThreshold(0.5, -1)).toBe(false);
  });
});
