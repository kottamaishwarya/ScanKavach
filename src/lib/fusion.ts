/**
 * @license
 * SPDX-License-Identifier: MIT
 * Decision Support Fusion Logic: Combines Anomaly Detector + Supervised Classifier
 */

import {
  DISAGREEMENT_PROB,
  HIGH_CONFIDENCE,
  MIN_CONFIDENCE,
} from '../config';
import { VerdictLabel } from './verdict';

export type FusionOutcome =
  | 'Consistent-normal'
  | 'Suggested-condition'
  | 'Conflict'
  | 'Inconclusive'
  | 'No-model';

export interface ClassProbability {
  className: string;
  probability: number; // [0, 1]
}

export interface FusionResult {
  outcome: FusionOutcome;
  topClass: string;
  topProbability: number;
  isHighConfidence: boolean;
  message: string;
  recommendedAction: string;
}

export interface FusionConfig {
  minConfidence?: number;
  highConfidence?: number;
  disagreementProb?: number;
}

/**
 * Pure fusion engine merging unsupervised anomaly screening with supervised classifier
 */
export function fuseSignals(
  anomalyVerdict: VerdictLabel,
  borderline: boolean,
  classProbs: ClassProbability[],
  config?: FusionConfig
): FusionResult {
  const minConf = config?.minConfidence ?? MIN_CONFIDENCE;
  const highConf = config?.highConfidence ?? HIGH_CONFIDENCE;
  const disagreeProb = config?.disagreementProb ?? DISAGREEMENT_PROB;

  if (!classProbs || classProbs.length === 0) {
    return {
      outcome: 'No-model',
      topClass: 'Unknown',
      topProbability: 0,
      isHighConfidence: false,
      message: 'No condition model loaded.',
      recommendedAction: 'Anomaly screening only. Optional condition classifier can be trained or imported.',
    };
  }

  // Sort descending by probability
  const sorted = [...classProbs].sort((a, b) => b.probability - a.probability);
  const top = sorted[0];
  const isNormalClass = top.className.toLowerCase() === 'normal';
  const isHighConfidence = top.probability >= highConf;

  // 1. Conflict detection
  const classifierSaysDisease = !isNormalClass && top.probability >= disagreeProb;
  const anomalySaysHealthy = anomalyVerdict === 'Normal' && !borderline;

  const classifierSaysNormal = isNormalClass && top.probability >= disagreeProb;
  const anomalySaysRefer = anomalyVerdict === 'Refer';

  if ((classifierSaysDisease && anomalySaysHealthy) || (classifierSaysNormal && anomalySaysRefer)) {
    return {
      outcome: 'Conflict',
      topClass: top.className,
      topProbability: Math.round(top.probability * 100) / 100,
      isHighConfidence,
      message: 'Signals disagree. A clinician review is strongly recommended.',
      recommendedAction: 'Ask a clinician to review this scan immediately.',
    };
  }

  // 2. Inconclusive check (low confidence)
  if (top.probability < minConf) {
    const isUnusual = anomalyVerdict === 'Review' || anomalyVerdict === 'Refer';
    return {
      outcome: 'Inconclusive',
      topClass: top.className,
      topProbability: Math.round(top.probability * 100) / 100,
      isHighConfidence: false,
      message: isUnusual
        ? 'The model is not confident. Unusual pattern present but condition unclear.'
        : 'Model confidence is below threshold; finding inconclusive.',
      recommendedAction: 'Ask a clinician to review this scan.',
    };
  }

  // 3. Consistent-normal
  if (anomalyVerdict === 'Normal' && isNormalClass) {
    return {
      outcome: 'Consistent-normal',
      topClass: top.className,
      topProbability: Math.round(top.probability * 100) / 100,
      isHighConfidence,
      message: 'Both anomaly screening and condition pattern classifier align as normal.',
      recommendedAction: 'Routine observation; follow up if clinical symptoms persist.',
    };
  }

  // 4. Suggested-condition
  if (!isNormalClass && (anomalyVerdict === 'Review' || anomalyVerdict === 'Refer')) {
    const confLevel = isHighConfidence ? 'high' : 'moderate';
    return {
      outcome: 'Suggested-condition',
      topClass: top.className,
      topProbability: Math.round(top.probability * 100) / 100,
      isHighConfidence,
      message: `Pattern most similar to: ${top.className} (${Math.round(top.probability * 100)}% model confidence, ${confLevel}).`,
      recommendedAction: `Ask a clinician to evaluate for ${top.className}.`,
    };
  }

  // Default fallback if boundary
  return {
    outcome: 'Inconclusive',
    topClass: top.className,
    topProbability: Math.round(top.probability * 100) / 100,
    isHighConfidence,
    message: 'Borderline signal alignment.',
    recommendedAction: 'Ask a clinician to review this scan.',
  };
}
