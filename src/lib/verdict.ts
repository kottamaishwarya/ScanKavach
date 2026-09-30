/**
 * @license
 * SPDX-License-Identifier: MIT
 * Calibrated Verdict Calculation with Borderline Detection
 */

import { BORDERLINE_MARGIN } from '../config';

export type VerdictLabel = 'Normal' | 'Review' | 'Refer';

export interface VerdictThresholds {
  reviewThreshold: number;
  referThreshold: number;
}

export interface VerdictResult {
  label: VerdictLabel;
  borderline: boolean;
  percentile: number;
  percentileText: string;
  explanation: string;
}

/**
 * Calculates empirical percentile against sorted healthy validation scores
 */
export function calculatePercentile(score: number, sortedValidationScores: number[]): number {
  if (!sortedValidationScores || sortedValidationScores.length === 0) {
    return 50;
  }
  let countBelow = 0;
  for (let i = 0; i < sortedValidationScores.length; i++) {
    if (sortedValidationScores[i] < score) {
      countBelow++;
    } else {
      break;
    }
  }
  const pct = (countBelow / sortedValidationScores.length) * 100;
  return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
}

/**
 * Determines whether a score is within relative borderline margin of a threshold
 */
export function isNearThreshold(score: number, threshold: number, marginFraction = BORDERLINE_MARGIN): boolean {
  if (threshold <= 0) {
    return false;
  }
  const delta = Math.abs(score - threshold);
  return delta <= threshold * marginFraction;
}

/**
 * Computes calibrated verdict, borderline flag, and percentile
 */
export function computeVerdict(
  score: number,
  thresholds: VerdictThresholds,
  sortedValidationScores: number[] = [],
  marginFraction = BORDERLINE_MARGIN
): VerdictResult {
  const { reviewThreshold, referThreshold } = thresholds;

  let label: VerdictLabel = 'Normal';
  if (score >= referThreshold) {
    label = 'Refer';
  } else if (score >= reviewThreshold) {
    label = 'Review';
  }

  const nearReview = isNearThreshold(score, reviewThreshold, marginFraction);
  const nearRefer = isNearThreshold(score, referThreshold, marginFraction);
  const borderline = nearReview || nearRefer;

  const percentile = calculatePercentile(score, sortedValidationScores);
  const percentileText = `More unusual than ${percentile}% of healthy validation scans`;

  let explanation = '';
  if (label === 'Normal') {
    explanation = 'Pattern falls within the expected healthy range.';
  } else if (label === 'Review') {
    explanation = 'Pattern shows moderate deviation from healthy baseline (approx. 5% expected). Human review recommended.';
  } else {
    explanation = 'Pattern shows marked deviation from healthy baseline (top 1% percentile). Priority referral advised.';
  }

  if (borderline) {
    explanation += ' Borderline score: clinician review needed.';
  }

  return {
    label,
    borderline,
    percentile,
    percentileText,
    explanation,
  };
}
