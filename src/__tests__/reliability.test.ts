/**
 * Unit tests for Reliability Assessment & Abstain Rule (reliability.ts)
 */
import { describe, expect, it } from 'vitest';
import { evaluateReliability } from '../lib/reliability';

describe('Reliability Assessment & Abstain Rule (reliability.ts)', () => {
  it('returns High reliability when all signals are clean and robust', () => {
    const res = evaluateReliability(true, false, false, 80, 'Consistent-normal');
    expect(res.level).toBe('High');
    expect(res.shouldAbstain).toBe(false);
  });

  it('triggers abstain rule when anomaly screening and classifier conflict', () => {
    const res = evaluateReliability(true, false, false, 80, 'Conflict');
    expect(res.level).toBe('Low');
    expect(res.shouldAbstain).toBe(true);
    expect(res.abstainReason).toBe('Not reliable enough to score: human review needed.');
  });

  it('triggers abstain rule on combined scanner shift and borderline score', () => {
    const res = evaluateReliability(true, true, true, 80);
    expect(res.shouldAbstain).toBe(true);
    expect(res.level).toBe('Low');
  });

  it('marks Low reliability if safety gate rejected', () => {
    const res = evaluateReliability(false, false, false, 80);
    expect(res.level).toBe('Low');
    expect(res.shouldAbstain).toBe(true);
  });
});
