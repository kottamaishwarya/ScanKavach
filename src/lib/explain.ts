/**
 * @license
 * SPDX-License-Identifier: MIT
 * Explanation generator: 3x3 region localization and plain-language explanation
 */

export type GridRegion =
  | 'upper left'
  | 'upper centre'
  | 'upper right'
  | 'centre left'
  | 'centre'
  | 'centre right'
  | 'lower left'
  | 'lower centre'
  | 'lower right';

/**
 * Calculates percentage of image area exceeding the patch-level anomaly threshold
 */
export function calculateAreaPercent(patchScores: number[], patchThreshold: number): number {
  if (!patchScores || patchScores.length === 0) {
    return 0;
  }
  let hotCount = 0;
  for (const s of patchScores) {
    if (s > patchThreshold) {
      hotCount++;
    }
  }
  const pct = (hotCount / patchScores.length) * 100;
  return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
}

/**
 * Maps a 2D patch heatmap (e.g. 14x14) to a 3x3 spatial grid and finds peak region
 */
export function findPeakRegion(patchScores: number[], gridDim = 14): GridRegion {
  if (!patchScores || patchScores.length === 0) {
    return 'centre';
  }

  const regionSums: Record<GridRegion, number> = {
    'upper left': 0,
    'upper centre': 0,
    'upper right': 0,
    'centre left': 0,
    'centre': 0,
    'centre right': 0,
    'lower left': 0,
    'lower centre': 0,
    'lower right': 0,
  };

  const colStep = gridDim / 3;
  const rowStep = gridDim / 3;

  for (let r = 0; r < gridDim; r++) {
    for (let c = 0; c < gridDim; c++) {
      const idx = r * gridDim + c;
      const score = patchScores[idx] ?? 0;

      const rBucket = r < colStep ? 0 : r < colStep * 2 ? 1 : 2;
      const cBucket = c < rowStep ? 0 : c < rowStep * 2 ? 1 : 2;

      let key: GridRegion = 'centre';
      if (rBucket === 0) {
        key = cBucket === 0 ? 'upper left' : cBucket === 1 ? 'upper centre' : 'upper right';
      } else if (rBucket === 1) {
        key = cBucket === 0 ? 'centre left' : cBucket === 1 ? 'centre' : 'centre right';
      } else {
        key = cBucket === 0 ? 'lower left' : cBucket === 1 ? 'lower centre' : 'lower right';
      }

      regionSums[key] += score;
    }
  }

  let maxRegion: GridRegion = 'centre';
  let maxVal = -Infinity;
  for (const [reg, val] of Object.entries(regionSums) as [GridRegion, number][]) {
    if (val > maxVal) {
      maxVal = val;
      maxRegion = reg;
    }
  }

  return maxRegion;
}

/**
 * Builds a plain-language explanation sentence.
 * Always refers to "of the image" and includes "Not a diagnosis."
 */
export function buildExplanationSentence(areaPct: number, region: GridRegion): string {
  if (areaPct <= 0) {
    return 'No region stands out from the healthy reference set. Not a diagnosis.';
  }
  return `Unusual pattern in the ${region} of the image, about ${areaPct}% of the area. Not a diagnosis.`;
}
