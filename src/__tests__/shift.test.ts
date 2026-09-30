/**
 * Unit tests for Scanner Shift Detection (shift.ts)
 */
import { describe, expect, it } from 'vitest';
import { detectScannerShift, ImageGlobalStats, ValidationDistribution } from '../lib/shift';

describe('Scanner Shift Detector (shift.ts)', () => {
  const normalDist: ValidationDistribution = {
    meanIntensity: 0.5,
    stdIntensity: 0.15,
    meanEmbeddingDistance: 1.0,
  };

  it('detects no shift on consistent normal scan', () => {
    const stats: ImageGlobalStats = {
      meanIntensity: 0.51,
      stdIntensity: 0.14,
      embeddingDistance: 1.05,
      fractionAboveMedianPatch: 0.45,
    };
    const res = detectScannerShift(stats, normalDist);
    expect(res.hasShift).toBe(false);
  });

  it('detects a global scanner protocol shift when all patches are uniformly elevated', () => {
    const stats: ImageGlobalStats = {
      meanIntensity: 0.85, // huge intensity deviation
      stdIntensity: 0.45, // huge contrast deviation
      embeddingDistance: 2.8,
      fractionAboveMedianPatch: 0.85, // uniformly high patches -> global shift
    };
    const res = detectScannerShift(stats, normalDist);
    expect(res.hasShift).toBe(true);
    expect(res.isGlobalShift).toBe(true);
    expect(res.message).toContain('different scanner or protocol');
  });

  it('distinguishes a true focal localized lesion from a global scanner shift', () => {
    // Focal lesion: only a small proportion of patches are hot, not a uniform global shift
    const stats: ImageGlobalStats = {
      meanIntensity: 0.52,
      stdIntensity: 0.16,
      embeddingDistance: 1.5,
      fractionAboveMedianPatch: 0.25, // Only 25% of patches high
    };
    const res = detectScannerShift(stats, normalDist);
    expect(res.isGlobalShift).toBe(false);
    expect(res.hasShift).toBe(false);
  });
});
