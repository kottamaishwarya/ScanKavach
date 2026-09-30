/**
 * Unit tests for Clinical Guidance & Next Steps (nextSteps.ts)
 */
import { describe, expect, it } from 'vitest';
import { getNextSteps } from '../lib/nextSteps';

describe('Next Steps Action Guidance (nextSteps.ts)', () => {
  it('returns routine advice for healthy normal scans', () => {
    const res = getNextSteps('Normal', false, true);
    expect(res.urgency).toBe('routine');
    expect(res.primaryMessage).toContain('healthy baseline');
  });

  it('advises clinician review for borderline scores', () => {
    const res = getNextSteps('Normal', true, true);
    expect(res.urgency).toBe('review');
    expect(res.primaryMessage).toContain('Borderline');
  });

  it('advises rapid follow up for Refer verdict', () => {
    const res = getNextSteps('Refer', false, true);
    expect(res.urgency).toBe('urgent');
    expect(res.actionItems.length).toBeGreaterThan(0);
  });

  it('advises proper radiograph upload if safety gate failed', () => {
    const res = getNextSteps('Normal', false, false);
    expect(res.primaryMessage).toContain('could not be evaluated');
  });
});
