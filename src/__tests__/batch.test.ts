/**
 * Unit tests for Batch Triage (batch.ts)
 */
import { describe, expect, it } from 'vitest';
import { BatchItemResult, exportBatchCsv, sortBatchByPriority } from '../lib/batch';

describe('Batch Triage (batch.ts)', () => {
  it('sorts batch items descending by percentile for prioritized triage', () => {
    const items: BatchItemResult[] = [
      { id: '1', fileName: 'low.png', gatePassed: true, percentile: 25.0, timestamp: '' },
      { id: '2', fileName: 'high.png', gatePassed: true, percentile: 99.5, timestamp: '' },
      { id: '3', fileName: 'mid.png', gatePassed: true, percentile: 75.0, timestamp: '' },
    ];

    const sorted = sortBatchByPriority(items);
    expect(sorted[0].fileName).toBe('high.png');
    expect(sorted[1].fileName).toBe('mid.png');
    expect(sorted[2].fileName).toBe('low.png');
  });

  it('exports safe CSV with formula injection prevention', () => {
    const items: BatchItemResult[] = [
      {
        id: '1',
        fileName: '=cmd|calc.exe',
        gatePassed: false,
        gateReason: 'Color image',
        timestamp: '2026-09-30',
      },
    ];

    const csv = exportBatchCsv(items);
    expect(csv).toContain("''=cmd|calc.exe".slice(1)); // neutralised leading =
  });
});
