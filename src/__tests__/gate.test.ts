/**
 * Unit tests for Input Safety Gate (gate.ts)
 */
import { describe, expect, it } from 'vitest';
import { evaluateSafetyGate, GateInputStats, GateLimits } from '../lib/gate';

describe('Input Safety Gate (gate.ts)', () => {
  const sharpGrayscale: GateInputStats = {
    colorDiff: 2.1,
    contrastStd: 0.18,
    laplacianVariance: 32.5,
    embeddingDistanceToBank: 0.8,
  };

  const limits: GateLimits = {
    blurLimit: 15.0,
    oodLimit: 2.0,
  };

  it('passes a standard sharp grayscale chest X-ray', () => {
    const res = evaluateSafetyGate(sharpGrayscale, limits);
    expect(res.passed).toBe(true);
    expect(res.reasons.length).toBe(0);
    expect(res.metrics.colorDiff).toBe(2.1);
  });

  it('rejects a color photograph or selfie', () => {
    const colorPhoto: GateInputStats = {
      ...sharpGrayscale,
      colorDiff: 25.4, // Above limit 12
    };
    const res = evaluateSafetyGate(colorPhoto, limits);
    expect(res.passed).toBe(false);
    expect(res.reasons).toContain('This is a colour photo. Expected a grayscale medical scan.');
  });

  it('rejects a low-contrast or blank image', () => {
    const blankImage: GateInputStats = {
      ...sharpGrayscale,
      contrastStd: 0.02, // Below 0.05
    };
    const res = evaluateSafetyGate(blankImage, limits);
    expect(res.passed).toBe(false);
    expect(res.reasons).toContain('The image has too little contrast to assess.');
  });

  it('rejects a blurry image below blur threshold', () => {
    const blurryImage: GateInputStats = {
      ...sharpGrayscale,
      laplacianVariance: 8.5, // Below 15.0
    };
    const res = evaluateSafetyGate(blurryImage, limits);
    expect(res.passed).toBe(false);
    expect(res.reasons).toContain('The image is too blurry to assess reliably.');
  });

  it('rejects an out-of-distribution (wrong body part) scan', () => {
    const wrongBodyPart: GateInputStats = {
      ...sharpGrayscale,
      embeddingDistanceToBank: 3.5, // Above 2.0
    };
    const res = evaluateSafetyGate(wrongBodyPart, limits);
    expect(res.passed).toBe(false);
    expect(res.reasons).toContain(
      'This does not look like the type of scan the reference set was built from (for example, not a chest X-ray).'
    );
  });

  it('handles multiple concurrent failures cleanly', () => {
    const terribleInput: GateInputStats = {
      colorDiff: 30.0,
      contrastStd: 0.01,
      laplacianVariance: 2.0,
      embeddingDistanceToBank: 4.5,
    };
    const res = evaluateSafetyGate(terribleInput, limits);
    expect(res.passed).toBe(false);
    expect(res.reasons.length).toBe(4);
  });

  it('handles boundary threshold values accurately', () => {
    // Exactly at contrast limit (0.05) should pass contrast check
    const boundaryInput: GateInputStats = {
      colorDiff: 12.0, // Exactly at 12 limit (must not exceed 12)
      contrastStd: 0.05,
      laplacianVariance: 15.0,
    };
    const res = evaluateSafetyGate(boundaryInput, limits);
    expect(res.passed).toBe(true);
  });

  it('handles default blur limits when no custom calibration is passed', () => {
    const input: GateInputStats = {
      colorDiff: 3.0,
      contrastStd: 0.2,
      laplacianVariance: 14.0, // below DEFAULT_BLUR_LIMIT (15)
    };
    const res = evaluateSafetyGate(input);
    expect(res.passed).toBe(false);
    expect(res.reasons).toContain('The image is too blurry to assess reliably.');
  });
});
