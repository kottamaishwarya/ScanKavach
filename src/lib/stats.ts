/**
 * @license
 * SPDX-License-Identifier: MIT
 * Statistical aggregation functions for dashboard metrics
 */

import { VerdictLabel } from './verdict';

export interface HistoryItem {
  id: string;
  fileName: string;
  timestamp: string;
  gatePassed: boolean;
  score?: number;
  percentile?: number;
  verdict?: VerdictLabel;
  borderline?: boolean;
  areaPercent?: number;
  region?: string;
  sentence?: string;
  suggestion?: string;
  fusionOutcome?: string;
  shiftFlag?: boolean;
  reliability?: string;
  totalLatencyMs?: number;
}

export interface DashboardStats {
  totalScans: number;
  gateRejections: number;
  normalCount: number;
  reviewCount: number;
  referCount: number;
  borderlineCount: number;
  avgLatencyMs: number;
  verdictDistribution: { name: string; value: number }[];
  dailyTrend: { day: string; count: number }[];
  recentScores: { index: number; score: number; verdict: string }[];
  suggestionDistribution: { name: string; count: number }[];
}

/**
 * Pure aggregation function for history entries
 */
export function computeDashboardStats(history: HistoryItem[]): DashboardStats {
  if (!history || history.length === 0) {
    return {
      totalScans: 0,
      gateRejections: 0,
      normalCount: 0,
      reviewCount: 0,
      referCount: 0,
      borderlineCount: 0,
      avgLatencyMs: 0,
      verdictDistribution: [
        { name: 'Normal', value: 0 },
        { name: 'Review', value: 0 },
        { name: 'Refer', value: 0 },
      ],
      dailyTrend: [],
      recentScores: [],
      suggestionDistribution: [],
    };
  }

  let gateRejections = 0;
  let normalCount = 0;
  let reviewCount = 0;
  let referCount = 0;
  let borderlineCount = 0;
  let latencySum = 0;
  let latencySamples = 0;

  const suggestionMap = new Map<string, number>();

  for (const item of history) {
    if (!item.gatePassed) {
      gateRejections++;
    } else {
      if (item.verdict === 'Normal') normalCount++;
      else if (item.verdict === 'Review') reviewCount++;
      else if (item.verdict === 'Refer') referCount++;

      if (item.borderline) borderlineCount++;

      if (item.suggestion && item.suggestion !== 'Unknown') {
        suggestionMap.set(item.suggestion, (suggestionMap.get(item.suggestion) ?? 0) + 1);
      }
    }

    if (item.totalLatencyMs && item.totalLatencyMs > 0) {
      latencySum += item.totalLatencyMs;
      latencySamples++;
    }
  }

  // 7-day trend
  const dailyMap = new Map<string, number>();
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(5, 10); // MM-DD
    dailyMap.set(key, 0);
  }

  for (const item of history) {
    const key = item.timestamp.slice(5, 10);
    if (dailyMap.has(key)) {
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
    }
  }

  const dailyTrend = Array.from(dailyMap.entries()).map(([day, count]) => ({
    day,
    count,
  }));

  // Last 30 scores
  const recentScores = history
    .filter((h) => h.gatePassed && typeof h.score === 'number')
    .slice(0, 30)
    .reverse()
    .map((h, idx) => ({
      index: idx + 1,
      score: Math.round((h.score ?? 0) * 100) / 100,
      verdict: h.verdict ?? 'Normal',
    }));

  const suggestionDistribution = Array.from(suggestionMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  return {
    totalScans: history.length,
    gateRejections,
    normalCount,
    reviewCount,
    referCount,
    borderlineCount,
    avgLatencyMs: latencySamples > 0 ? Math.round(latencySum / latencySamples) : 0,
    verdictDistribution: [
      { name: 'Normal', value: normalCount },
      { name: 'Review', value: reviewCount },
      { name: 'Refer', value: referCount },
    ],
    dailyTrend,
    recentScores,
    suggestionDistribution,
  };
}
