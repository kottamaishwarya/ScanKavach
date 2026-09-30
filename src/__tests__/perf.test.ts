/**
 * Unit tests for Performance Profiling (perf.ts)
 */
import { describe, expect, it } from 'vitest';
import { aggregateTimings, StageTimings } from '../lib/perf';

describe('Performance Profiling (perf.ts)', () => {
  it('aggregates latency records accurately and checks 1-second target', () => {
    const timings: StageTimings[] = [
      {
        preprocessing: 40,
        featureExtraction: 120,
        gate: 20,
        nnSearch: 100,
        heatmap: 30,
        classifier: 20,
        total: 330,
      },
      {
        preprocessing: 50,
        featureExtraction: 130,
        gate: 20,
        nnSearch: 110,
        heatmap: 30,
        classifier: 20,
        total: 360,
      },
    ];

    const agg = aggregateTimings(timings);
    expect(agg.samples).toBe(2);
    expect(agg.avgTotal).toBe(345);
    expect(agg.meetsUnder1sTarget).toBe(true);
  });

  it('flags when average total latency exceeds 1000ms', () => {
    const heavy: StageTimings[] = [
      {
        preprocessing: 200,
        featureExtraction: 500,
        gate: 100,
        nnSearch: 300,
        heatmap: 100,
        classifier: 50,
        total: 1250,
      },
    ];
    const agg = aggregateTimings(heavy);
    expect(agg.meetsUnder1sTarget).toBe(false);
  });

  it('handles empty timings list gracefully', () => {
    const agg = aggregateTimings([]);
    expect(agg.samples).toBe(0);
    expect(agg.avgTotal).toBe(0);
    expect(agg.meetsUnder1sTarget).toBe(true);
  });
});
