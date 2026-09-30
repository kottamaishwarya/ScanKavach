/**
 * Unit tests for Explanation and Localization (explain.ts)
 */
import { describe, expect, it } from 'vitest';
import {
  buildExplanationSentence,
  calculateAreaPercent,
  findPeakRegion,
} from '../lib/explain';

describe('Explanation & Localization (explain.ts)', () => {
  it('calculates area percent accurately', () => {
    // 50 patches out of 100 above 0.8 = 50%
    const patches = Array.from({ length: 100 }, (_, i) => (i < 50 ? 0.9 : 0.2));
    const pct = calculateAreaPercent(patches, 0.8);
    expect(pct).toBe(50);
  });

  it('clamps area percent to [0, 100]', () => {
    expect(calculateAreaPercent([], 0.8)).toBe(0);
    const allHot = [1.0, 1.2, 1.5];
    expect(calculateAreaPercent(allHot, 0.5)).toBe(100);
  });

  it('correctly maps 14x14 grid into 3x3 peak region', () => {
    // Create 196 array (14x14)
    const grid = new Array(196).fill(0.1);
    // Put intense values in lower right quadrant (rows 10-13, cols 10-13)
    for (let r = 10; r < 14; r++) {
      for (let c = 10; c < 14; c++) {
        grid[r * 14 + c] = 5.0;
      }
    }

    const peak = findPeakRegion(grid, 14);
    expect(peak).toBe('lower right');
  });

  it('identifies upper left quadrant when hot spot is at origin', () => {
    const grid = new Array(196).fill(0.1);
    grid[0] = 10.0;
    grid[1] = 10.0;
    grid[14] = 10.0;
    const peak = findPeakRegion(grid, 14);
    expect(peak).toBe('upper left');
  });

  it('builds explanation sentence strictly with "of the image" and "Not a diagnosis."', () => {
    const sentence = buildExplanationSentence(14.2, 'lower right');
    expect(sentence).toBe(
      'Unusual pattern in the lower right of the image, about 14.2% of the area. Not a diagnosis.'
    );
    expect(sentence).toContain('of the image');
    expect(sentence).toContain('Not a diagnosis.');
    expect(sentence).not.toContain('lung');
  });

  it('returns baseline sentence when area percent is zero', () => {
    const sentence = buildExplanationSentence(0, 'centre');
    expect(sentence).toBe(
      'No region stands out from the healthy reference set. Not a diagnosis.'
    );
  });

  it('handles empty or malformed inputs without throwing', () => {
    expect(findPeakRegion([], 14)).toBe('centre');
    expect(calculateAreaPercent([], 1.0)).toBe(0);
  });
});
