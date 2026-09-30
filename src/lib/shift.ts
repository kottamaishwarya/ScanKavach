/**
 * @license
 * SPDX-License-Identifier: MIT
 * Scanner & Protocol Shift Detector
 * Distinguishes true localized disease patterns from global scanner differences
 */

import { SHIFT_LIMIT } from '../config';

export interface ImageGlobalStats {
  meanIntensity: number; // [0, 1]
  stdIntensity: number;
  embeddingDistance: number;
  fractionAboveMedianPatch: number; // proportion of patches with scores above median threshold
}

export interface ValidationDistribution {
  meanIntensity: number;
  stdIntensity: number;
  meanEmbeddingDistance: number;
}

export interface ShiftDetectionResult {
  hasShift: boolean;
  shiftScore: number;
  isGlobalShift: boolean;
  message: string;
}

/**
 * Computes statistical deviation of scan from healthy reference distribution
 */
export function detectScannerShift(
  stats: ImageGlobalStats,
  validationDist: ValidationDistribution,
  limit = SHIFT_LIMIT
): ShiftDetectionResult {
  const intensityDiff = Math.abs(stats.meanIntensity - validationDist.meanIntensity);
  const stdDiff = Math.abs(stats.stdIntensity - validationDist.stdIntensity);
  const distRatio = validationDist.meanEmbeddingDistance > 0
    ? stats.embeddingDistance / validationDist.meanEmbeddingDistance
    : 1;

  // Normalized composite distance
  const shiftScore = (intensityDiff * 5) + (stdDiff * 5) + (distRatio > 1.5 ? distRatio - 1 : 0);

  // A global scanner shift usually elevates almost all patches uniformly (> 60% above median)
  // whereas a localized focal lesion elevates only a localized fraction
  const isGlobalShift = stats.fractionAboveMedianPatch > 0.65;
  const hasShift = shiftScore > limit && isGlobalShift;

  const message = hasShift
    ? 'This scan may come from a different scanner or protocol. The score may reflect the device, not disease.'
    : 'Scanner characteristics appear consistent with the reference set.';

  return {
    hasShift,
    shiftScore: Math.round(shiftScore * 100) / 100,
    isGlobalShift,
    message,
  };
}
