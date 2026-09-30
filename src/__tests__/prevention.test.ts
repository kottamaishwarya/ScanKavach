/**
 * Unit tests for Prevention Checklist (prevention.ts)
 */
import { describe, expect, it } from 'vitest';
import {
  calculatePreventionProgress,
  DEFAULT_PREVENTION_ITEMS,
  PreventionItem,
} from '../lib/prevention';

describe('Prevention Checklist (prevention.ts)', () => {
  it('calculates completion progress percentage correctly', () => {
    const items: PreventionItem[] = [
      { id: '1', title: 'A', whyThisHelps: '', completed: true },
      { id: '2', title: 'B', whyThisHelps: '', completed: false },
      { id: '3', title: 'C', whyThisHelps: '', completed: false },
      { id: '4', title: 'D', whyThisHelps: '', completed: false },
    ];
    expect(calculatePreventionProgress(items)).toBe(25);
  });

  it('handles empty items array safely', () => {
    expect(calculatePreventionProgress([])).toBe(0);
  });

  it('provides default prevention items with rationale tooltips', () => {
    expect(DEFAULT_PREVENTION_ITEMS.length).toBeGreaterThan(5);
    for (const item of DEFAULT_PREVENTION_ITEMS) {
      expect(item.whyThisHelps.length).toBeGreaterThan(10);
    }
  });
});
