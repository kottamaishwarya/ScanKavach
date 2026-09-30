/**
 * @license
 * SPDX-License-Identifier: MIT
 * Input Safety Gate: Prevents invalid, blurry, colour, or out-of-distribution inputs
 */

import {
  COLOR_DIFF_LIMIT,
  DEFAULT_BLUR_LIMIT,
  MIN_CONTRAST_STD,
} from '../config';

export interface GateInputStats {
  colorDiff: number;
  contrastStd: number;
  laplacianVariance: number;
  embeddingDistanceToBank?: number;
}

export interface GateLimits {
  blurLimit?: number;
  oodLimit?: number;
}

export interface GateResult {
  passed: boolean;
  reasons: string[];
  metrics: {
    colorDiff: number;
    contrastStd: number;
    laplacianVariance: number;
    embeddingDistance?: number;
  };
}

/**
 * Pure evaluation function for the safety gate
 */
export function evaluateSafetyGate(
  stats: GateInputStats,
  limits?: GateLimits
): GateResult {
  const reasons: string[] = [];
  const blurThreshold = limits?.blurLimit ?? DEFAULT_BLUR_LIMIT;

  // 1. Color photo check
  if (stats.colorDiff > COLOR_DIFF_LIMIT) {
    reasons.push('This is a colour photo. Expected a grayscale medical scan.');
  }

  // 2. Low contrast or blank scan
  if (stats.contrastStd < MIN_CONTRAST_STD) {
    reasons.push('The image has too little contrast to assess.');
  }

  // 3. Blur check
  if (stats.laplacianVariance < blurThreshold) {
    reasons.push('The image is too blurry to assess reliably.');
  }

  // 4. Out-of-distribution / Wrong body part check
  if (
    limits?.oodLimit !== undefined &&
    stats.embeddingDistanceToBank !== undefined &&
    stats.embeddingDistanceToBank > limits.oodLimit
  ) {
    reasons.push(
      'This does not look like the type of scan the reference set was built from (for example, not a chest X-ray).'
    );
  }

  return {
    passed: reasons.length === 0,
    reasons,
    metrics: {
      colorDiff: Math.round(stats.colorDiff * 100) / 100,
      contrastStd: Math.round(stats.contrastStd * 1000) / 1000,
      laplacianVariance: Math.round(stats.laplacianVariance * 100) / 100,
      embeddingDistance:
        stats.embeddingDistanceToBank !== undefined
          ? Math.round(stats.embeddingDistanceToBank * 1000) / 1000
          : undefined,
    },
  };
}
