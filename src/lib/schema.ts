/**
 * @license
 * SPDX-License-Identifier: MIT
 * Schema validation for imported JSON models and banks
 */

import { Result, ok, err } from './logger';

export interface ValidatedBankJson {
  version: string;
  name: string;
  reviewThreshold: number;
  referThreshold: number;
  patchThreshold: number;
  blurLimit: number;
  oodLimit: number;
  patchCount: number;
  featureDim: number;
  patches: number[][];
  patchImageIds: number[];
  thumbnails: Record<string, string>;
  validationStats: {
    meanIntensity: number;
    stdIntensity: number;
    meanEmbeddingDistance: number;
  };
}

export interface ValidatedModelJson {
  version: string;
  classes: string[];
  weights: number[][]; // [dim, numClasses]
  biases: number[];
  temperature: number;
  metrics: {
    accuracy: number;
    macroAuroc: number;
    testSamples: number;
  };
}

/**
 * Validates bank JSON schema strictly
 */
export function validateBankJson(data: unknown): Result<ValidatedBankJson, string> {
  if (!data || typeof data !== 'object') {
    return err('Invalid bank data: not an object');
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.name !== 'string' || obj.name.trim() === '') {
    return err('Missing or invalid bank name');
  }

  const numFields = [
    'reviewThreshold',
    'referThreshold',
    'patchThreshold',
    'blurLimit',
    'oodLimit',
    'patchCount',
    'featureDim',
  ] as const;

  for (const f of numFields) {
    if (typeof obj[f] !== 'number' || !Number.isFinite(obj[f])) {
      return err(`Missing or invalid numeric field: ${f}`);
    }
  }

  if (!Array.isArray(obj.patches) || obj.patches.length === 0) {
    return err('Bank must contain a non-empty patches array');
  }

  if (!Array.isArray(obj.patchImageIds) || obj.patchImageIds.length !== obj.patches.length) {
    return err('patchImageIds must match patches length');
  }

  return ok(obj as unknown as ValidatedBankJson);
}

/**
 * Validates condition model JSON schema strictly
 */
export function validateModelJson(data: unknown): Result<ValidatedModelJson, string> {
  if (!data || typeof data !== 'object') {
    return err('Invalid model data: not an object');
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.classes) || obj.classes.length < 2) {
    return err('Model must contain at least 2 classes');
  }

  if (!Array.isArray(obj.weights) || !Array.isArray(obj.biases)) {
    return err('Model weights or biases missing or invalid');
  }

  if (typeof obj.temperature !== 'number' || obj.temperature <= 0 || !Number.isFinite(obj.temperature)) {
    return err('Model temperature must be a positive finite number');
  }

  return ok(obj as unknown as ValidatedModelJson);
}
