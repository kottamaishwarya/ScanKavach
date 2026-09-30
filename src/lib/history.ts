/**
 * @license
 * SPDX-License-Identifier: MIT
 * History persistence management (No image data stored)
 */

import { HISTORY_LIMIT } from '../config';
import { toCsvString } from './csv';
import { logger } from './logger';
import { AnalysisResult } from './scorer';
import { HistoryItem } from './stats';

const MEMORY_HISTORY: HistoryItem[] = [];

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem('scankavach_history');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    logger.warn('Failed reading history from localStorage', err);
  }
  return [...MEMORY_HISTORY];
}

export function saveAnalysisToHistory(analysis: AnalysisResult): HistoryItem {
  const item: HistoryItem = {
    id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fileName: analysis.fileName,
    timestamp: analysis.timestamp,
    gatePassed: analysis.gateResult.passed,
    score: analysis.score,
    percentile: analysis.verdict?.percentile,
    verdict: analysis.verdict?.label,
    borderline: analysis.verdict?.borderline,
    areaPercent: analysis.areaPercent,
    region: analysis.region,
    sentence: analysis.explanationSentence,
    suggestion: analysis.fusionResult?.topClass,
    fusionOutcome: analysis.fusionResult?.outcome,
    shiftFlag: analysis.shiftResult?.hasShift,
    reliability: analysis.reliabilityResult?.level,
    totalLatencyMs: analysis.timings.total,
  };

  const list = getHistory();
  list.unshift(item);
  if (list.length > HISTORY_LIMIT) {
    list.length = HISTORY_LIMIT;
  }

  try {
    localStorage.setItem('scankavach_history', JSON.stringify(list));
  } catch {
    MEMORY_HISTORY.unshift(item);
    if (MEMORY_HISTORY.length > HISTORY_LIMIT) {
      MEMORY_HISTORY.length = HISTORY_LIMIT;
    }
  }

  return item;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem('scankavach_history');
  } catch {
    // ignore
  }
  MEMORY_HISTORY.length = 0;
}

export function exportHistoryCsv(): string {
  const items = getHistory();
  const headers = [
    'Scan ID',
    'File Name',
    'Timestamp',
    'Gate Passed',
    'Anomaly Score',
    'Percentile (%)',
    'Verdict',
    'Borderline',
    'Area Percent (%)',
    'Peak Region',
    'Suggested Finding',
    'Fusion Outcome',
    'Scanner Shift',
    'Reliability',
    'Latency (ms)',
  ];

  const rows = items.map((i) => [
    i.id,
    i.fileName,
    i.timestamp,
    i.gatePassed ? 'Yes' : 'No',
    i.score ?? 'N/A',
    i.percentile ?? 'N/A',
    i.verdict ?? 'N/A',
    i.borderline ? 'Yes' : 'No',
    i.areaPercent ?? 'N/A',
    i.region ?? 'N/A',
    i.suggestion ?? 'N/A',
    i.fusionOutcome ?? 'N/A',
    i.shiftFlag ? 'Yes' : 'No',
    i.reliability ?? 'N/A',
    i.totalLatencyMs ?? 'N/A',
  ]);

  return toCsvString(headers, rows);
}

/**
 * Loads clearly labeled synthetic demo records for testing and demonstration
 */
export function loadSampleHistory(): HistoryItem[] {
  const samples: HistoryItem[] = [
    {
      id: 'sample-1',
      fileName: 'synthetic-cxr-normal-01.png',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      gatePassed: true,
      score: 0.62,
      percentile: 45.2,
      verdict: 'Normal',
      borderline: false,
      areaPercent: 0,
      region: 'centre',
      sentence: 'No region stands out from the healthy reference set. Not a diagnosis.',
      suggestion: 'Normal',
      fusionOutcome: 'Consistent-normal',
      shiftFlag: false,
      reliability: 'High',
      totalLatencyMs: 380,
    },
    {
      id: 'sample-2',
      fileName: 'synthetic-cxr-pneumonia-infiltrate.png',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      gatePassed: true,
      score: 1.48,
      percentile: 98.4,
      verdict: 'Review',
      borderline: true,
      areaPercent: 14.2,
      region: 'lower right',
      sentence: 'Unusual pattern in the lower right of the image, about 14.2% of the area. Not a diagnosis.',
      suggestion: 'Pneumonia',
      fusionOutcome: 'Suggested-condition',
      shiftFlag: false,
      reliability: 'Medium',
      totalLatencyMs: 440,
    },
    {
      id: 'sample-3',
      fileName: 'synthetic-cxr-apical-cavitary.png',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      gatePassed: true,
      score: 2.15,
      percentile: 99.8,
      verdict: 'Refer',
      borderline: false,
      areaPercent: 21.8,
      region: 'upper right',
      sentence: 'Unusual pattern in the upper right of the image, about 21.8% of the area. Not a diagnosis.',
      suggestion: 'Tuberculosis',
      fusionOutcome: 'Suggested-condition',
      shiftFlag: false,
      reliability: 'High',
      totalLatencyMs: 410,
    },
    {
      id: 'sample-4',
      fileName: 'synthetic-selfie-rejection.jpg',
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      gatePassed: false,
      reliability: 'Low',
      totalLatencyMs: 85,
    },
  ];

  try {
    localStorage.setItem('scankavach_history', JSON.stringify(samples));
  } catch {
    MEMORY_HISTORY.length = 0;
    MEMORY_HISTORY.push(...samples);
  }

  return samples;
}
