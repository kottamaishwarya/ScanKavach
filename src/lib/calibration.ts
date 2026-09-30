/**
 * @license
 * SPDX-License-Identifier: MIT
 * Calibration and Split Engine for Healthy Baseline Memory Bank
 */

import {
  BANK_FRACTION,
  DEFAULT_BLUR_LIMIT,
  OOD_MARGIN,
  REFER_PERCENTILE,
  REVIEW_PERCENTILE,
} from '../config';

export interface CalibrationThresholds {
  reviewThreshold: number;
  referThreshold: number;
  patchThreshold: number;
  blurLimit: number;
  oodLimit: number;
  sortedValidationScores: number[];
}

/**
 * Computes percentile from a sorted numeric array (0-100)
 */
export function percentileOfSorted(sorted: number[], p: number): number {
  if (!sorted || sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];

  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) {
    return sorted[lower];
  }
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Deterministically or pseudo-randomly splits items into bank and validation sets
 * Guaranteed to have non-overlapping indices.
 */
export function splitBankAndValidation<T>(items: T[], bankFraction = BANK_FRACTION): { bank: T[]; validation: T[] } {
  if (!items || items.length === 0) {
    return { bank: [], validation: [] };
  }

  // Shallow copy and deterministic shuffle
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  const bankCount = Math.max(1, Math.floor(copy.length * bankFraction));
  const bank = copy.slice(0, bankCount);
  const validation = copy.slice(bankCount);

  return { bank, validation };
}

/**
 * Computes calibration parameters from validation execution metrics
 */
export function calibrateParameters(
  validationImageScores: number[],
  validationPatchScores: number[],
  validationLaplacianVariances: number[],
  validationEmbeddingDistances: number[]
): CalibrationThresholds {
  const sortedImageScores = [...validationImageScores].sort((a, b) => a - b);
  const sortedPatchScores = [...validationPatchScores].sort((a, b) => a - b);
  const sortedLaplacians = [...validationLaplacianVariances].sort((a, b) => a - b);
  const sortedDistances = [...validationEmbeddingDistances].sort((a, b) => a - b);

  const reviewThreshold = percentileOfSorted(sortedImageScores, REVIEW_PERCENTILE);
  const referThreshold = percentileOfSorted(sortedImageScores, REFER_PERCENTILE);
  const patchThreshold = percentileOfSorted(sortedPatchScores, 99);

  // Blur limit: half of 5th percentile of validation Laplacian variance, minimum 1
  const fifthPctLaplacian = percentileOfSorted(sortedLaplacians, 5);
  const blurLimit = Math.max(1, fifthPctLaplacian > 0 ? fifthPctLaplacian * 0.5 : DEFAULT_BLUR_LIMIT);

  // OOD limit: max validation embedding distance * OOD_MARGIN
  const maxDistance = sortedDistances.length > 0 ? sortedDistances[sortedDistances.length - 1] : 1.0;
  const oodLimit = maxDistance * OOD_MARGIN;

  return {
    reviewThreshold: Math.round(reviewThreshold * 1000) / 1000,
    referThreshold: Math.round(referThreshold * 1000) / 1000,
    patchThreshold: Math.round(patchThreshold * 1000) / 1000,
    blurLimit: Math.round(blurLimit * 10) / 10,
    oodLimit: Math.round(oodLimit * 1000) / 1000,
    sortedValidationScores: sortedImageScores,
  };
}
