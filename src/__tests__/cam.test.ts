/**
 * Unit tests for Class Activation Mapping (cam.ts)
 */
import { describe, expect, it } from 'vitest';
import { computeClassActivationMap } from '../lib/cam';

describe('Class Activation Mapping (cam.ts)', () => {
  it('computes class activation map bounded by [0, 1]', () => {
    // 4 spatial vectors of dimension 2
    const spatialFeatures = [
      [1.0, 0.0],
      [0.0, 1.0],
      [2.0, 2.0],
      [0.0, 0.0],
    ];
    const classWeights = [1.0, 1.0]; // Dot products: 1, 1, 4, 0

    const cam = computeClassActivationMap(spatialFeatures, classWeights, 2);
    expect(cam.length).toBe(4);
    expect(cam[2]).toBe(1.0); // max dot product 4 -> normalized to 1.0
    expect(cam[3]).toBe(0.0); // min dot product 0 -> normalized to 0.0
    expect(cam[0]).toBe(0.25); // (1 - 0) / 4 = 0.25
  });

  it('handles empty inputs safely', () => {
    const cam = computeClassActivationMap([], [], 14);
    expect(cam.length).toBe(196);
    expect(cam.every((v) => v === 0)).toBe(true);
  });
});
