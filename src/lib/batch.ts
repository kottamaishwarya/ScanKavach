/**
 * @license
 * SPDX-License-Identifier: MIT
 * Batch Triage Utilities & Sorting
 */

import { toCsvString } from './csv';
import { VerdictLabel } from './verdict';

export interface BatchItemResult {
  id: string;
  fileName: string;
  thumbnailUrl?: string;
  gatePassed: boolean;
  gateReason?: string;
  score?: number;
  percentile?: number;
  verdict?: VerdictLabel;
  borderline?: boolean;
  shiftFlag?: boolean;
  suggestion?: string;
  confidence?: number;
  timestamp: string;
}

/**
 * Pure function: sorts batch items descending by percentile (priority triage)
 */
export function sortBatchByPriority(items: BatchItemResult[]): BatchItemResult[] {
  return [...items].sort((a, b) => {
    // Failed gate items or highest percentile first
    const aP = a.percentile ?? -1;
    const bP = b.percentile ?? -1;
    return bP - aP;
  });
}

/**
 * Exports batch items to safe CSV string
 */
export function exportBatchCsv(items: BatchItemResult[]): string {
  const headers = [
    'File Name',
    'Gate Status',
    'Gate Rejection Reason',
    'Anomaly Score',
    'Percentile (%)',
    'Verdict',
    'Borderline',
    'Scanner Shift',
    'Suggested Finding',
    'Confidence',
    'Timestamp',
  ];

  const rows = items.map((item) => [
    item.fileName,
    item.gatePassed ? 'Passed' : 'Rejected',
    item.gateReason || 'None',
    item.score !== undefined ? item.score : 'N/A',
    item.percentile !== undefined ? item.percentile : 'N/A',
    item.verdict || 'N/A',
    item.borderline ? 'Yes' : 'No',
    item.shiftFlag ? 'Yes' : 'No',
    item.suggestion || 'N/A',
    item.confidence !== undefined ? item.confidence : 'N/A',
    item.timestamp,
  ]);

  return toCsvString(headers, rows);
}
