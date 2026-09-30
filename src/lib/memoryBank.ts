/**
 * @license
 * SPDX-License-Identifier: MIT
 * Memory Bank Management: Patch storage, nearest-neighbour search, persistence, import/export
 */

import {
  BANK_FRACTION,
  MAX_BANK_PATCHES,
  MAX_THUMBNAILS,
  TOPK_PATCHES,
} from '../config';
import { calibrateParameters, CalibrationThresholds, splitBankAndValidation } from './calibration';
import { extractFeatures, getTf } from './extractor';
import { createThumbnailUrl, extractImageQualityMetrics } from './imageUtils';
import { logger } from './logger';
import { validateBankJson, ValidatedBankJson } from './schema';

export interface BankData {
  version: string;
  name: string;
  createdAt: string;
  reviewThreshold: number;
  referThreshold: number;
  patchThreshold: number;
  blurLimit: number;
  oodLimit: number;
  patchCount: number;
  featureDim: number;
  patches: number[][]; // [P, D]
  patchImageIds: number[]; // [P]
  globalEmbeddings: { imageId: number; embedding: number[] }[];
  thumbnails: Record<string, string>; // imageId -> base64
  sortedValidationScores: number[];
  validationStats: {
    meanIntensity: number;
    stdIntensity: number;
    meanEmbeddingDistance: number;
  };
}

let activeBank: BankData | null = null;
const MEMORY_BANK_CACHE: { current: BankData | null } = { current: null };

export function getActiveBank(): BankData | null {
  return activeBank ?? MEMORY_BANK_CACHE.current;
}

export function setActiveBank(bank: BankData | null): void {
  activeBank = bank;
  MEMORY_BANK_CACHE.current = bank;
  if (bank) {
    try {
      localStorage.setItem('scankavach_bank_meta', JSON.stringify({
        name: bank.name,
        patchCount: bank.patchCount,
        reviewThreshold: bank.reviewThreshold,
        referThreshold: bank.referThreshold,
      }));
    } catch {
      // ignore
    }
  }
}

/**
 * Builds healthy memory bank from raw images with progress reporting
 */
export async function buildMemoryBank(
  images: { id: number; element: HTMLImageElement | HTMLCanvasElement; name: string }[],
  onProgress?: (msg: string, percent: number) => void
): Promise<BankData> {
  const { bank: bankImages, validation: valImages } = splitBankAndValidation(images, BANK_FRACTION);

  onProgress?.('Extracting features from bank scans...', 10);

  const rawPatches: number[][] = [];
  const rawPatchIds: number[] = [];
  const globalEmbeddings: { imageId: number; embedding: number[] }[] = [];
  const thumbnails: Record<string, string> = {};

  let dim = 128;

  // Process bank set
  for (let i = 0; i < bankImages.length; i++) {
    const item = bankImages[i];
    const feat = await extractFeatures(item.element);
    dim = feat.featureDim;

    for (const p of feat.patchFeatures) {
      rawPatches.push(p);
      rawPatchIds.push(item.id);
    }

    globalEmbeddings.push({ imageId: item.id, embedding: feat.globalEmbedding });

    if (Object.keys(thumbnails).length < MAX_THUMBNAILS) {
      thumbnails[String(item.id)] = createThumbnailUrl(item.element);
    }

    const pct = 10 + Math.round((i / bankImages.length) * 35);
    onProgress?.(`Processing healthy reference scan ${i + 1}/${bankImages.length}...`, pct);
  }

  // Randomly subsample patches if exceeding MAX_BANK_PATCHES
  let patches = rawPatches;
  let patchImageIds = rawPatchIds;

  if (rawPatches.length > MAX_BANK_PATCHES) {
    const indices: number[] = [];
    for (let i = 0; i < rawPatches.length; i++) indices.push(i);
    // Shuffle indices
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const selected = indices.slice(0, MAX_BANK_PATCHES);
    patches = selected.map((idx) => rawPatches[idx]);
    patchImageIds = selected.map((idx) => rawPatchIds[idx]);
  }

  onProgress?.('Calibrating against held-out validation set...', 50);

  // Evaluate held-out validation images
  const valImageScores: number[] = [];
  const valPatchScores: number[] = [];
  const valLaplacians: number[] = [];
  const valDistances: number[] = [];
  let valIntensitySum = 0;
  let valIntensitySqSum = 0;

  for (let i = 0; i < valImages.length; i++) {
    const item = valImages[i];
    const q = extractImageQualityMetrics(item.element);
    valLaplacians.push(q.laplacianVariance);
    valIntensitySum += q.meanIntensity;
    valIntensitySqSum += q.meanIntensity * q.meanIntensity;

    const feat = await extractFeatures(item.element);

    // Compute patch nearest-neighbour distances against bank
    const patchDistances = await computePatchDistances(feat.patchFeatures, patches);
    for (const d of patchDistances) valPatchScores.push(d);

    // Top-k patch score average for image score
    const sortedD = [...patchDistances].sort((a, b) => b - a);
    const topk = sortedD.slice(0, TOPK_PATCHES);
    const imageScore = topk.reduce((acc, v) => acc + v, 0) / topk.length;
    valImageScores.push(imageScore);

    // Distance to nearest bank global embedding
    let minGlobalDist = Infinity;
    for (const g of globalEmbeddings) {
      const d = euclideanDistance(feat.globalEmbedding, g.embedding);
      if (d < minGlobalDist) minGlobalDist = d;
    }
    valDistances.push(minGlobalDist);

    const pct = 50 + Math.round((i / valImages.length) * 45);
    onProgress?.(`Validating scan ${i + 1}/${valImages.length}...`, pct);
  }

  const valCount = Math.max(1, valImages.length);
  const meanIntensity = valIntensitySum / valCount;
  const varianceIntensity = Math.max(0, valIntensitySqSum / valCount - meanIntensity * meanIntensity);
  const stdIntensity = Math.sqrt(varianceIntensity);
  const meanDistance = valDistances.reduce((acc, v) => acc + v, 0) / valCount;

  // Derive calibrated thresholds
  const cal: CalibrationThresholds = calibrateParameters(
    valImageScores,
    valPatchScores,
    valLaplacians,
    valDistances
  );

  const bankData: BankData = {
    version: '1.0.0',
    name: `Bank-${new Date().toISOString().slice(0, 10)}`,
    createdAt: new Date().toISOString(),
    reviewThreshold: cal.reviewThreshold,
    referThreshold: cal.referThreshold,
    patchThreshold: cal.patchThreshold,
    blurLimit: cal.blurLimit,
    oodLimit: cal.oodLimit,
    patchCount: patches.length,
    featureDim: dim,
    patches,
    patchImageIds,
    globalEmbeddings,
    thumbnails,
    sortedValidationScores: cal.sortedValidationScores,
    validationStats: {
      meanIntensity,
      stdIntensity,
      meanEmbeddingDistance: meanDistance,
    },
  };

  setActiveBank(bankData);
  onProgress?.('Memory bank calibrated successfully!', 100);
  return bankData;
}

/**
 * Computes chunked nearest-neighbour Euclidean distance for each query patch against bank patches
 */
export async function computePatchDistances(
  queryPatches: number[][],
  bankPatches: number[][]
): Promise<number[]> {
  const tf = await getTf();
  const Q = queryPatches.length;
  const B = bankPatches.length;

  if (Q === 0 || B === 0) return [];

  return tf.tidy(() => {
    const qTensor = tf.tensor2d(queryPatches); // [Q, D]
    const bTensor = tf.tensor2d(bankPatches); // [B, D]

    // (q - b)^2 = ||q||^2 + ||b||^2 - 2 * q . b^T
    const qNorms = tf.sum(tf.square(qTensor), 1, true); // [Q, 1]
    const bNorms = tf.sum(tf.square(bTensor), 1).expandDims(0); // [1, B]

    // Matmul: [Q, D] x [D, B] -> [Q, B]
    const dot = tf.matMul(qTensor, bTensor, false, true);
    const distSq = tf.add(tf.sub(qNorms, tf.mul(tf.scalar(2), dot)), bNorms);
    const clampedDistSq = tf.maximum(distSq, tf.scalar(0));
    const dist = tf.sqrt(clampedDistSq);

    // Minimum distance for each query patch across all bank patches
    const minDists = tf.min(dist, 1);
    return Array.from(minDists.dataSync());
  });
}

export function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/**
 * Exports current memory bank as JSON string
 */
export function exportBankJson(bank: BankData): string {
  return JSON.stringify(bank, null, 2);
}

/**
 * Imports and validates bank JSON data
 */
export function importBankJson(jsonString: string): BankData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Malformed JSON string.');
  }

  const result = validateBankJson(parsed);
  if (!result.ok) {
    throw new Error(result.error);
  }

  const valid = result.value;
  const bank: BankData = {
    ...valid,
    createdAt: new Date().toISOString(),
    globalEmbeddings: (valid as any).globalEmbeddings || [],
    sortedValidationScores: (valid as any).sortedValidationScores || [],
  };

  setActiveBank(bank);
  return bank;
}
