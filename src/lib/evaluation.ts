/**
 * @license
 * SPDX-License-Identifier: MIT
 * Evaluation metrics: AUROC (Mann-Whitney U), ROC points, and operating points
 */

export interface EvaluationSample {
  score: number;
  isAbnormal: boolean;
}

export interface RocPoint {
  fpr: number; // false positive rate (1 - specificity)
  tpr: number; // true positive rate (sensitivity)
  threshold: number;
}

export interface OperatingPointMetrics {
  threshold: number;
  sensitivity: number; // TPR
  specificity: number; // TNR (1 - FPR)
  falsePositiveRate: number; // FPR
  healthyFlaggedPercent: number;
}

/**
 * Computes Area Under the ROC Curve using Mann-Whitney U statistic
 */
export function computeAuroc(normals: number[], abnormals: number[]): number {
  if (!normals || normals.length === 0 || !abnormals || abnormals.length === 0) {
    return 0.5;
  }

  // Combine and sort with ranks
  const combined: { score: number; label: 0 | 1 }[] = [
    ...normals.map((s) => ({ score: s, label: 0 as const })),
    ...abnormals.map((s) => ({ score: s, label: 1 as const })),
  ];

  combined.sort((a, b) => a.score - b.score);

  // Assign average ranks to ties
  let rankSumAbnormals = 0;
  let i = 0;
  const n = combined.length;

  while (i < n) {
    let j = i;
    while (j < n - 1 && combined[j + 1].score === combined[j].score) {
      j++;
    }
    const averageRank = (i + 1 + j + 1) / 2;
    for (let k = i; k <= j; k++) {
      if (combined[k].label === 1) {
        rankSumAbnormals += averageRank;
      }
    }
    i = j + 1;
  }

  const n1 = abnormals.length;
  const n0 = normals.length;

  // U1 = rankSum - (n1 * (n1 + 1)) / 2
  const u1 = rankSumAbnormals - (n1 * (n1 + 1)) / 2;
  const auroc = u1 / (n1 * n0);

  return Math.min(1, Math.max(0, Math.round(auroc * 1000) / 1000));
}

/**
 * Calculates sensitivity and specificity at a designated threshold
 */
export function sensitivitySpecificityAt(
  threshold: number,
  normals: number[],
  abnormals: number[]
): OperatingPointMetrics {
  const totalNormals = normals.length || 1;
  const totalAbnormals = abnormals.length || 1;

  let fp = 0;
  for (const s of normals) {
    if (s >= threshold) fp++;
  }

  let tp = 0;
  for (const s of abnormals) {
    if (s >= threshold) tp++;
  }

  const sensitivity = Math.round((tp / totalAbnormals) * 1000) / 1000;
  const fpr = Math.round((fp / totalNormals) * 1000) / 1000;
  const specificity = Math.round((1 - fpr) * 1000) / 1000;

  return {
    threshold: Math.round(threshold * 100) / 100,
    sensitivity,
    specificity,
    falsePositiveRate: fpr,
    healthyFlaggedPercent: Math.round(fpr * 1000) / 10,
  };
}

/**
 * Generates sorted ROC curve coordinate points
 */
export function generateRocPoints(normals: number[], abnormals: number[], steps = 50): RocPoint[] {
  if (normals.length === 0 || abnormals.length === 0) {
    return [
      { fpr: 0, tpr: 0, threshold: 1 },
      { fpr: 1, tpr: 1, threshold: 0 },
    ];
  }

  const allScores = [...normals, ...abnormals].sort((a, b) => a - b);
  const minScore = allScores[0] - 0.01;
  const maxScore = allScores[allScores.length - 1] + 0.01;
  const stepSize = (maxScore - minScore) / steps;

  const points: RocPoint[] = [{ fpr: 0, tpr: 0, threshold: maxScore }];

  for (let s = maxScore; s >= minScore; s -= stepSize) {
    const m = sensitivitySpecificityAt(s, normals, abnormals);
    points.push({
      fpr: m.falsePositiveRate,
      tpr: m.sensitivity,
      threshold: Math.round(s * 100) / 100,
    });
  }

  points.push({ fpr: 1, tpr: 1, threshold: minScore });

  // Ensure monotonicity and deduplicate
  points.sort((a, b) => a.fpr - b.fpr || a.tpr - b.tpr);
  return points;
}
