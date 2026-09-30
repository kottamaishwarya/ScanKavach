/**
 * Unit tests for Strict JSON Schema Validation (schema.ts)
 */
import { describe, expect, it } from 'vitest';
import { validateBankJson, validateModelJson } from '../lib/schema';

describe('Strict JSON Schema Validation (schema.ts)', () => {
  it('validates a correct bank JSON object', () => {
    const validBank = {
      version: '1.0.0',
      name: 'Normal-Bank',
      reviewThreshold: 1.1,
      referThreshold: 1.5,
      patchThreshold: 0.8,
      blurLimit: 12.0,
      oodLimit: 1.8,
      patchCount: 2,
      featureDim: 2,
      patches: [[0.1, 0.2], [0.3, 0.4]],
      patchImageIds: [1, 2],
      thumbnails: {},
      validationStats: { meanIntensity: 0.5, stdIntensity: 0.1, meanEmbeddingDistance: 0.8 },
    };

    const res = validateBankJson(validBank);
    expect(res.ok).toBe(true);
  });

  it('rejects bank JSON missing numerical thresholds', () => {
    const malformed = {
      name: 'Bad-Bank',
      reviewThreshold: 'not-a-number',
      patches: [[1, 2]],
    };
    const res = validateBankJson(malformed);
    expect(res.ok).toBe(false);
  });

  it('validates correct condition model JSON', () => {
    const validModel = {
      version: '1.0.0',
      classes: ['Normal', 'Pneumonia'],
      weights: [[0.1, 0.2]],
      biases: [0.0, 0.0],
      temperature: 1.2,
      metrics: { accuracy: 0.9, macroAuroc: 0.95, testSamples: 20 },
    };
    const res = validateModelJson(validModel);
    expect(res.ok).toBe(true);
  });

  it('rejects model JSON with negative or zero temperature', () => {
    const invalid = {
      classes: ['Normal', 'Pneumonia'],
      weights: [[0.1, 0.2]],
      biases: [0.0, 0.0],
      temperature: -0.5,
    };
    const res = validateModelJson(invalid);
    expect(res.ok).toBe(false);
  });
});
