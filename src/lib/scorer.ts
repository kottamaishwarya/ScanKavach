/**
 * @license
 * SPDX-License-Identifier: MIT
 * Image anomaly scoring and spatial heatmap computation
 */

import { TOPK_PATCHES } from '../config';
import { buildExplanationSentence, calculateAreaPercent, findPeakRegion, GridRegion } from './explain';
import { extractFeatures } from './extractor';
import { FusionResult, fuseSignals } from './fusion';
import { evaluateSafetyGate, GateResult } from './gate';
import { extractImageQualityMetrics } from './imageUtils';
import { BankData, computePatchDistances, euclideanDistance, getActiveBank } from './memoryBank';
import { getNextSteps, NextStepsGuidance } from './nextSteps';
import { recordTiming, StageTimings } from './perf';
import { evaluateReliability, ReliabilityResult } from './reliability';
import { detectScannerShift, ShiftDetectionResult } from './shift';
import { getLoadedConditionModel, predictCondition } from './suggest';
import { computeVerdict, VerdictResult } from './verdict';

export interface AnalysisResult {
  fileName: string;
  timestamp: string;
  gateResult: GateResult;
  score?: number;
  verdict?: VerdictResult;
  patchScores?: number[];
  areaPercent?: number;
  region?: GridRegion;
  explanationSentence?: string;
  nearestHealthyThumbnail?: string;
  nearestHealthyDistance?: number;
  shiftResult?: ShiftDetectionResult;
  reliabilityResult?: ReliabilityResult;
  fusionResult?: FusionResult;
  nextSteps?: NextStepsGuidance;
  timings: StageTimings;
}

/**
 * Runs complete analysis pipeline on a single image element or canvas
 */
export async function analyzeImage(
  source: HTMLImageElement | HTMLCanvasElement,
  fileName: string,
  bankOverride?: BankData | null
): Promise<AnalysisResult> {
  const bank = bankOverride ?? getActiveBank();
  const startTime = performance.now();

  // 1. Preprocessing & Quality extraction
  const t0 = performance.now();
  const quality = extractImageQualityMetrics(source);
  const tPre = performance.now() - t0;

  // 2. Feature Extraction
  const t1 = performance.now();
  const feat = await extractFeatures(source);
  const tFeat = performance.now() - t1;

  // Calculate embedding distance to bank if bank available
  let nearestBankDist: number | undefined;
  let nearestThumbnail: string | undefined;

  if (bank && bank.globalEmbeddings && bank.globalEmbeddings.length > 0) {
    let minDist = Infinity;
    let minId = bank.globalEmbeddings[0].imageId;
    for (const g of bank.globalEmbeddings) {
      const d = euclideanDistance(feat.globalEmbedding, g.embedding);
      if (d < minDist) {
        minDist = d;
        minId = g.imageId;
      }
    }
    nearestBankDist = minDist;
    nearestThumbnail = bank.thumbnails[String(minId)];
  }

  // 3. Safety Gate Check
  const t2 = performance.now();
  const gateResult = evaluateSafetyGate(
    {
      colorDiff: quality.colorDiff,
      contrastStd: quality.contrastStd,
      laplacianVariance: quality.laplacianVariance,
      embeddingDistanceToBank: nearestBankDist,
    },
    bank ? { blurLimit: bank.blurLimit, oodLimit: bank.oodLimit } : undefined
  );
  const tGate = performance.now() - t2;

  // If gate fails: halt processing early, return reject result with timings
  if (!gateResult.passed) {
    const totalTime = performance.now() - startTime;
    const timings: StageTimings = {
      preprocessing: Math.round(tPre),
      featureExtraction: Math.round(tFeat),
      gate: Math.round(tGate),
      nnSearch: 0,
      heatmap: 0,
      classifier: 0,
      total: Math.round(totalTime),
    };
    recordTiming(timings);

    return {
      fileName,
      timestamp: new Date().toISOString(),
      gateResult,
      timings,
      nextSteps: getNextSteps('Normal', false, false),
    };
  }

  // 4. Nearest-Neighbour Search over Patches
  const t3 = performance.now();
  let patchScores: number[] = [];
  let score = 0;

  if (bank && bank.patches.length > 0) {
    patchScores = await computePatchDistances(feat.patchFeatures, bank.patches);
    const sorted = [...patchScores].sort((a, b) => b - a);
    const topk = sorted.slice(0, TOPK_PATCHES);
    score = topk.reduce((acc, v) => acc + v, 0) / (topk.length || 1);
  } else {
    // Default baseline fallback if no bank loaded
    score = 0.5;
    patchScores = new Array(196).fill(0.5);
  }
  const tNn = performance.now() - t3;

  // 5. Heatmap & Region Explanation
  const t4 = performance.now();
  const patchThreshold = bank?.patchThreshold ?? 0.8;
  const areaPercent = calculateAreaPercent(patchScores, patchThreshold);
  const region = findPeakRegion(patchScores, 14);
  const explanationSentence = buildExplanationSentence(areaPercent, region);
  const tHeat = performance.now() - t4;

  // 6. Verdict Calculation
  const thresholds = {
    reviewThreshold: bank?.reviewThreshold ?? 1.0,
    referThreshold: bank?.referThreshold ?? 1.5,
  };
  const verdict = computeVerdict(score, thresholds, bank?.sortedValidationScores ?? []);

  // 7. Scanner Shift Detection
  const sortedPatches = [...patchScores].sort((a, b) => a - b);
  const medianPatch = sortedPatches[Math.floor(sortedPatches.length / 2)] || 0;
  let aboveMedianCount = 0;
  for (const p of patchScores) {
    if (p > medianPatch) aboveMedianCount++;
  }

  const shiftResult = detectScannerShift(
    {
      meanIntensity: quality.meanIntensity,
      stdIntensity: quality.contrastStd,
      embeddingDistance: nearestBankDist ?? 1.0,
      fractionAboveMedianPatch: aboveMedianCount / (patchScores.length || 1),
    },
    bank?.validationStats ?? {
      meanIntensity: 0.5,
      stdIntensity: 0.15,
      meanEmbeddingDistance: 1.0,
    }
  );

  // 8. Supervised Condition Classifier & Fusion
  const t5 = performance.now();
  const conditionModel = getLoadedConditionModel();
  let fusionResult: FusionResult | undefined;

  if (conditionModel) {
    const classProbs = predictCondition(feat.globalEmbedding, conditionModel);
    fusionResult = fuseSignals(verdict.label, verdict.borderline, classProbs);
  }
  const tClf = performance.now() - t5;

  // 9. Reliability Assessment & Next Steps
  const bankSize = bank ? bank.patches.length / 196 : 0;
  const reliabilityResult = evaluateReliability(
    gateResult.passed,
    shiftResult.hasShift,
    verdict.borderline,
    bankSize,
    fusionResult?.outcome
  );

  const nextSteps = getNextSteps(verdict.label, verdict.borderline, true, fusionResult);

  const totalTime = performance.now() - startTime;
  const timings: StageTimings = {
    preprocessing: Math.round(tPre),
    featureExtraction: Math.round(tFeat),
    gate: Math.round(tGate),
    nnSearch: Math.round(tNn),
    heatmap: Math.round(tHeat),
    classifier: Math.round(tClf),
    total: Math.round(totalTime),
  };
  recordTiming(timings);

  return {
    fileName,
    timestamp: new Date().toISOString(),
    gateResult,
    score: Math.round(score * 1000) / 1000,
    verdict,
    patchScores,
    areaPercent,
    region,
    explanationSentence,
    nearestHealthyThumbnail: nearestThumbnail,
    nearestHealthyDistance: nearestBankDist !== undefined ? Math.round(nearestBankDist * 1000) / 1000 : undefined,
    shiftResult,
    reliabilityResult,
    fusionResult,
    nextSteps,
    timings,
  };
}
