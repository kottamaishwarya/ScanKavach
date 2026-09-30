/**
 * Unit tests for Statistical Aggregation (stats.ts)
 */
import { describe, expect, it } from 'vitest';
import { computeDashboardStats, HistoryItem } from '../lib/stats';

describe('Statistical Aggregation (stats.ts)', () => {
  it('computes correct aggregates on populated history', () => {
    const history: HistoryItem[] = [
      {
        id: '1',
        fileName: 'scan1.png',
        timestamp: new Date().toISOString(),
        gatePassed: true,
        score: 0.5,
        verdict: 'Normal',
        borderline: false,
        totalLatencyMs: 200,
      },
      {
        id: '2',
        fileName: 'scan2.png',
        timestamp: new Date().toISOString(),
        gatePassed: true,
        score: 1.1,
        verdict: 'Review',
        borderline: true,
        totalLatencyMs: 300,
      },
      {
        id: '3',
        fileName: 'scan3.png',
        timestamp: new Date().toISOString(),
        gatePassed: true,
        score: 1.8,
        verdict: 'Refer',
        borderline: false,
        totalLatencyMs: 400,
      },
      {
        id: '4',
        fileName: 'selfie.jpg',
        timestamp: new Date().toISOString(),
        gatePassed: false,
        totalLatencyMs: 50,
      },
    ];

    const stats = computeDashboardStats(history);
    expect(stats.totalScans).toBe(4);
    expect(stats.gateRejections).toBe(1);
    expect(stats.normalCount).toBe(1);
    expect(stats.reviewCount).toBe(1);
    expect(stats.referCount).toBe(1);
    expect(stats.borderlineCount).toBe(1);
    expect(stats.avgLatencyMs).toBe(238); // (200 + 300 + 400 + 50) / 4 = 237.5 -> 238
  });

  it('handles empty history gracefully', () => {
    const stats = computeDashboardStats([]);
    expect(stats.totalScans).toBe(0);
    expect(stats.normalCount).toBe(0);
    expect(stats.avgLatencyMs).toBe(0);
    expect(stats.recentScores.length).toBe(0);
  });
});
