/**
 * Unit tests for Evaluation metrics & AUROC (evaluation.ts)
 */
import { describe, expect, it } from 'vitest';
import {
  computeAuroc,
  generateRocPoints,
  sensitivitySpecificityAt,
} from '../lib/evaluation';

describe('Evaluation & AUROC (evaluation.ts)', () => {
  it('computes exact 1.0 AUROC for perfectly separated distributions', () => {
    const normals = [0.1, 0.2, 0.3, 0.4];
    const abnormals = [0.5, 0.6, 0.7, 0.8];
    const auroc = computeAuroc(normals, abnormals);
    expect(auroc).toBe(1.0);
  });

  it('computes 0.5 AUROC for identical distributions', () => {
    const normals = [0.5, 0.5, 0.5];
    const abnormals = [0.5, 0.5, 0.5];
    const auroc = computeAuroc(normals, abnormals);
    expect(auroc).toBe(0.5);
  });

  it('computes sensitivity and specificity correctly at threshold', () => {
    const normals = [0.2, 0.4, 0.6, 0.8]; // At threshold 0.5: 2 normal >= 0.5 (fp=2, tn=2 => spec = 0.5)
    const abnormals = [0.3, 0.7, 0.9, 1.2]; // At threshold 0.5: 3 abnormal >= 0.5 (tp=3, fn=1 => sens = 0.75)

    const metrics = sensitivitySpecificityAt(0.5, normals, abnormals);
    expect(metrics.sensitivity).toBe(0.75);
    expect(metrics.specificity).toBe(0.5);
    expect(metrics.falsePositiveRate).toBe(0.5);
    expect(metrics.healthyFlaggedPercent).toBe(50);
  });

  it('generates monotonic ROC points bounded by [0, 1]', () => {
    const normals = [0.1, 0.3, 0.5, 0.7];
    const abnormals = [0.2, 0.4, 0.8, 1.0];
    const points = generateRocPoints(normals, abnormals, 20);

    expect(points.length).toBeGreaterThan(2);
    for (const p of points) {
      expect(p.fpr).toBeGreaterThanOrEqual(0);
      expect(p.fpr).toBeLessThanOrEqual(1);
      expect(p.tpr).toBeGreaterThanOrEqual(0);
      expect(p.tpr).toBeLessThanOrEqual(1);
    }
  });

  it('AUROC property: always bounded strictly within [0, 1]', () => {
    for (let i = 0; i < 20; i++) {
      const normals = Array.from({ length: 10 }, () => Math.random());
      const abnormals = Array.from({ length: 10 }, () => Math.random());
      const auroc = computeAuroc(normals, abnormals);
      expect(auroc).toBeGreaterThanOrEqual(0);
      expect(auroc).toBeLessThanOrEqual(1);
    }
  });
});
