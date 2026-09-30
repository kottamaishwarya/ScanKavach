/**
 * @license
 * SPDX-License-Identifier: MIT
 * Performance profiling and latency metrics
 */

export interface StageTimings {
  preprocessing: number;
  featureExtraction: number;
  gate: number;
  nnSearch: number;
  heatmap: number;
  classifier: number;
  total: number;
}

export interface AggregatedPerformance {
  samples: number;
  avgPreprocessing: number;
  avgFeatureExtraction: number;
  avgGate: number;
  avgNnSearch: number;
  avgHeatmap: number;
  avgClassifier: number;
  avgTotal: number;
  meetsUnder1sTarget: boolean;
}

const MEMORY_TIMINGS: StageTimings[] = [];

/**
 * Pure function to aggregate latency records
 */
export function aggregateTimings(records: StageTimings[]): AggregatedPerformance {
  if (!records || records.length === 0) {
    return {
      samples: 0,
      avgPreprocessing: 0,
      avgFeatureExtraction: 0,
      avgGate: 0,
      avgNnSearch: 0,
      avgHeatmap: 0,
      avgClassifier: 0,
      avgTotal: 0,
      meetsUnder1sTarget: true,
    };
  }

  const n = records.length;
  let sumPre = 0;
  let sumFeat = 0;
  let sumGate = 0;
  let sumNn = 0;
  let sumHeat = 0;
  let sumClf = 0;
  let sumTot = 0;

  for (const r of records) {
    sumPre += r.preprocessing;
    sumFeat += r.featureExtraction;
    sumGate += r.gate;
    sumNn += r.nnSearch;
    sumHeat += r.heatmap;
    sumClf += r.classifier;
    sumTot += r.total;
  }

  const avgTotal = Math.round((sumTot / n) * 10) / 10;

  return {
    samples: n,
    avgPreprocessing: Math.round((sumPre / n) * 10) / 10,
    avgFeatureExtraction: Math.round((sumFeat / n) * 10) / 10,
    avgGate: Math.round((sumGate / n) * 10) / 10,
    avgNnSearch: Math.round((sumNn / n) * 10) / 10,
    avgHeatmap: Math.round((sumHeat / n) * 10) / 10,
    avgClassifier: Math.round((sumClf / n) * 10) / 10,
    avgTotal,
    meetsUnder1sTarget: avgTotal <= 1000,
  };
}

export function recordTiming(timing: StageTimings): void {
  try {
    const raw = localStorage.getItem('scankavach_timings');
    const list: StageTimings[] = raw ? JSON.parse(raw) : [];
    list.push(timing);
    if (list.length > 20) {
      list.splice(0, list.length - 20);
    }
    localStorage.setItem('scankavach_timings', JSON.stringify(list));
  } catch {
    MEMORY_TIMINGS.push(timing);
    if (MEMORY_TIMINGS.length > 20) {
      MEMORY_TIMINGS.shift();
    }
  }
}

export function getRecentTimings(): StageTimings[] {
  try {
    const raw = localStorage.getItem('scankavach_timings');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return [...MEMORY_TIMINGS];
}
