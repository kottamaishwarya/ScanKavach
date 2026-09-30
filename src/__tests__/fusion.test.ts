/**
 * Unit tests for Fusion logic (fusion.ts)
 */
import { describe, expect, it } from 'vitest';
import { ClassProbability, fuseSignals } from '../lib/fusion';

describe('Signal Fusion Engine (fusion.ts)', () => {
  it('returns Consistent-normal when both screening and classifier agree', () => {
    const probs: ClassProbability[] = [
      { className: 'Normal', probability: 0.92 },
      { className: 'Pneumonia', probability: 0.08 },
    ];
    const res = fuseSignals('Normal', false, probs);
    expect(res.outcome).toBe('Consistent-normal');
    expect(res.topClass).toBe('Normal');
  });

  it('returns Suggested-condition when anomaly is Review/Refer and classifier predicts disease with high confidence', () => {
    const probs: ClassProbability[] = [
      { className: 'Pneumonia', probability: 0.88 },
      { className: 'Normal', probability: 0.12 },
    ];
    const res = fuseSignals('Review', false, probs);
    expect(res.outcome).toBe('Suggested-condition');
    expect(res.isHighConfidence).toBe(true);
    expect(res.topClass).toBe('Pneumonia');
    expect(res.message).toContain('Pattern most similar to: Pneumonia');
  });

  it('returns Conflict when classifier predicts strong disease but anomaly screening is Normal', () => {
    const probs: ClassProbability[] = [
      { className: 'Tuberculosis', probability: 0.85 },
      { className: 'Normal', probability: 0.15 },
    ];
    const res = fuseSignals('Normal', false, probs);
    expect(res.outcome).toBe('Conflict');
    expect(res.message).toContain('Signals disagree. A clinician review is strongly recommended.');
  });

  it('returns Conflict when classifier predicts Normal but anomaly screening is Refer', () => {
    const probs: ClassProbability[] = [
      { className: 'Normal', probability: 0.85 },
      { className: 'Pneumonia', probability: 0.15 },
    ];
    const res = fuseSignals('Refer', false, probs);
    expect(res.outcome).toBe('Conflict');
  });

  it('returns Inconclusive when top confidence is below threshold', () => {
    const probs: ClassProbability[] = [
      { className: 'Pneumonia', probability: 0.45 },
      { className: 'Tuberculosis', probability: 0.35 },
      { className: 'Normal', probability: 0.20 },
    ];
    const res = fuseSignals('Review', false, probs);
    expect(res.outcome).toBe('Inconclusive');
    expect(res.message).toContain('Unusual pattern present but condition unclear');
  });

  it('handles empty class probabilities gracefully (No-model)', () => {
    const res = fuseSignals('Normal', false, []);
    expect(res.outcome).toBe('No-model');
  });
});
