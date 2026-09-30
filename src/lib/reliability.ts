/**
 * @license
 * SPDX-License-Identifier: MIT
 * Reliability Assessment & Abstain Rule
 */

import { RECOMMENDED_NORMALS } from '../config';
import { FusionOutcome } from './fusion';

export type ReliabilityLevel = 'High' | 'Medium' | 'Low';

export interface ReliabilityResult {
  level: ReliabilityLevel;
  shouldAbstain: boolean;
  abstainReason?: string;
  factors: string[];
}

/**
 * Assesses operational reliability and flags when the system should abstain
 */
export function evaluateReliability(
  gatePassed: boolean,
  hasShift: boolean,
  borderline: boolean,
  bankSize: number,
  fusionOutcome?: FusionOutcome
): ReliabilityResult {
  const factors: string[] = [];

  if (!gatePassed) {
    return {
      level: 'Low',
      shouldAbstain: true,
      abstainReason: 'Image failed safety gate checks.',
      factors: ['Safety gate rejection'],
    };
  }

  if (bankSize < RECOMMENDED_NORMALS) {
    factors.push(`Small reference bank (${bankSize} < ${RECOMMENDED_NORMALS} recommended)`);
  }

  if (hasShift) {
    factors.push('Scanner/protocol shift detected');
  }

  if (borderline) {
    factors.push('Score sits in borderline margin between triage bands');
  }

  if (fusionOutcome === 'Conflict') {
    factors.push('Conflict between anomaly detector and condition classifier');
  }

  // Abstain rule: when signals are conflicting or shift + borderline
  const shouldAbstain =
    fusionOutcome === 'Conflict' ||
    (hasShift && borderline) ||
    (hasShift && fusionOutcome === 'Inconclusive');

  let level: ReliabilityLevel = 'High';
  if (shouldAbstain || factors.length >= 2) {
    level = 'Low';
  } else if (factors.length === 1) {
    level = 'Medium';
  }

  let abstainReason: string | undefined;
  if (shouldAbstain) {
    abstainReason = 'Not reliable enough to score: human review needed.';
  }

  return {
    level,
    shouldAbstain,
    abstainReason,
    factors,
  };
}
