/**
 * Unit tests for Classifier utilities, Stratified Split, and Temperature Scaling (classifier.ts)
 */
import { describe, expect, it } from 'vitest';
import {
  ClassSample,
  computeClassifierMetrics,
  fitTemperature,
  stratifiedSplit,
} from '../lib/classifier';

describe('Classifier Engine (classifier.ts)', () => {
  it('stratified split keeps exact class proportions without overlap', () => {
    const samples: ClassSample[] = [];
    // 20 class 0, 10 class 1
    for (let i = 0; i < 20; i++) samples.push({ id: `c0-${i}`, features: [i], labelIndex: 0 });
    for (let i = 0; i < 10; i++) samples.push({ id: `c1-${i}`, features: [i], labelIndex: 1 });

    const { train, test } = stratifiedSplit(samples, 0.8, 42);

    expect(train.length).toBe(24); // 16 class 0, 8 class 1
    expect(test.length).toBe(6); // 4 class 0, 2 class 1

    const trainIds = new Set(train.map((s) => s.id));
    for (const t of test) {
      expect(trainIds.has(t.id)).toBe(false);
    }
  });

  it('fitTemperature returns a positive finite scalar', () => {
    const logits = [
      [2.5, 0.5],
      [3.0, 0.2],
      [0.1, 2.8],
    ];
    const labels = [0, 0, 1];
    const temp = fitTemperature(logits, labels);

    expect(temp).toBeGreaterThan(0);
    expect(Number.isFinite(temp)).toBe(true);
  });

  it('computes classifier confusion matrix and macro AUROC accurately', () => {
    const actual = [0, 0, 1, 1];
    const predicted = [
      [0.9, 0.1],
      [0.85, 0.15],
      [0.1, 0.9],
      [0.2, 0.8],
    ];

    const metrics = computeClassifierMetrics(actual, predicted, ['Normal', 'Disease']);
    expect(metrics.overallAccuracy).toBe(1.0);
    expect(metrics.macroAuroc).toBe(1.0);
    expect(metrics.sensitivities).toEqual([1.0, 1.0]);
    expect(metrics.specificities).toEqual([1.0, 1.0]);
  });
});
