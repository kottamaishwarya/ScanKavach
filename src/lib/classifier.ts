/**
 * @license
 * SPDX-License-Identifier: MIT
 * Supervised condition pattern classifier (softmax regression head)
 */

export interface SplitResult<T> {
  train: T[];
  test: T[];
}

export interface ClassSample {
  id: string;
  features: number[];
  labelIndex: number;
}

export interface ConfusionMatrixData {
  matrix: number[][]; // [actual][predicted]
  classes: string[];
  accuracies: number[];
  sensitivities: number[];
  specificities: number[];
  macroAuroc: number;
  overallAccuracy: number;
}

/**
 * Stratified train/test split preserving class proportions
 */
export function stratifiedSplit(
  samples: ClassSample[],
  trainFraction = 0.8,
  seed = 42
): SplitResult<ClassSample> {
  // Group by labelIndex
  const byClass = new Map<number, ClassSample[]>();
  for (const s of samples) {
    if (!byClass.has(s.labelIndex)) {
      byClass.set(s.labelIndex, []);
    }
    byClass.get(s.labelIndex)!.push(s);
  }

  const train: ClassSample[] = [];
  const test: ClassSample[] = [];

  // Deterministic seeded pseudorandom function
  let currentSeed = seed;
  const pseudoRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  for (const [, classList] of byClass.entries()) {
    const list = [...classList];
    // Fisher-Yates with seeded random
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(pseudoRandom() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    const trainCount = Math.max(1, Math.floor(list.length * trainFraction));
    train.push(...list.slice(0, trainCount));
    test.push(...list.slice(trainCount));
  }

  return { train, test };
}

/**
 * Fits a single temperature scalar T > 0 on validation logits using Newton-Raphson or line search
 */
export function fitTemperature(logitsList: number[][], labels: number[]): number {
  if (!logitsList || logitsList.length === 0 || labels.length === 0) {
    return 1.0;
  }

  let bestTemp = 1.0;
  let minLoss = Infinity;

  // Search candidate temperatures from 0.5 to 3.0 in small steps
  for (let t = 0.5; t <= 3.0; t += 0.1) {
    let loss = 0;
    for (let i = 0; i < logitsList.length; i++) {
      const logits = logitsList[i];
      const target = labels[i];
      const scaled = logits.map((l) => l / t);
      const maxL = Math.max(...scaled);
      const expSum = scaled.reduce((acc, v) => acc + Math.exp(v - maxL), 0);
      const probTarget = Math.exp(scaled[target] - maxL) / expSum;
      loss += -Math.log(Math.max(1e-7, probTarget));
    }

    if (loss < minLoss) {
      minLoss = loss;
      bestTemp = t;
    }
  }

  return Math.round(bestTemp * 10) / 10;
}

/**
 * Computes confusion matrix, per-class sensitivity, specificity, and macro AUROC
 */
export function computeClassifierMetrics(
  actualLabels: number[],
  predictedProbs: number[][],
  classes: string[]
): ConfusionMatrixData {
  const numClasses = classes.length;
  const matrix: number[][] = Array.from({ length: numClasses }, () =>
    new Array(numClasses).fill(0)
  );

  let correctTotal = 0;
  const total = actualLabels.length || 1;

  for (let i = 0; i < actualLabels.length; i++) {
    const act = actualLabels[i];
    const probs = predictedProbs[i] || [];
    let pred = 0;
    let maxP = -1;
    for (let c = 0; c < numClasses; c++) {
      if ((probs[c] ?? 0) > maxP) {
        maxP = probs[c];
        pred = c;
      }
    }
    matrix[act][pred]++;
    if (act === pred) correctTotal++;
  }

  const accuracies: number[] = [];
  const sensitivities: number[] = [];
  const specificities: number[] = [];

  for (let c = 0; c < numClasses; c++) {
    const tp = matrix[c][c];
    let fn = 0;
    let fp = 0;
    let tn = 0;

    for (let r = 0; r < numClasses; r++) {
      for (let col = 0; col < numClasses; col++) {
        if (r === c && col !== c) fn += matrix[r][col];
        if (r !== c && col === c) fp += matrix[r][col];
        if (r !== c && col !== c) tn += matrix[r][col];
      }
    }

    const actualClassCount = tp + fn || 1;
    const actualNegCount = tn + fp || 1;

    sensitivities.push(Math.round((tp / actualClassCount) * 1000) / 1000);
    specificities.push(Math.round((tn / actualNegCount) * 1000) / 1000);
    accuracies.push(Math.round(((tp + tn) / (tp + tn + fp + fn || 1)) * 1000) / 1000);
  }

  // One-vs-Rest macro AUROC
  let aurocSum = 0;
  for (let c = 0; c < numClasses; c++) {
    const classScores: number[] = [];
    const classLabels: number[] = [];
    for (let i = 0; i < actualLabels.length; i++) {
      classScores.push(predictedProbs[i]?.[c] ?? 0);
      classLabels.push(actualLabels[i] === c ? 1 : 0);
    }

    // Rank sum for class
    let rankSum = 0;
    const combined = classScores.map((score, idx) => ({ score, label: classLabels[idx] }));
    combined.sort((a, b) => a.score - b.score);
    for (let r = 0; r < combined.length; r++) {
      if (combined[r].label === 1) rankSum += r + 1;
    }
    const n1 = classLabels.filter((l) => l === 1).length;
    const n0 = classLabels.length - n1;
    const u = n1 > 0 && n0 > 0 ? (rankSum - (n1 * (n1 + 1)) / 2) / (n1 * n0) : 0.5;
    aurocSum += Math.max(0, Math.min(1, u));
  }

  const macroAuroc = Math.round((aurocSum / (numClasses || 1)) * 1000) / 1000;
  const overallAccuracy = Math.round((correctTotal / total) * 1000) / 1000;

  return {
    matrix,
    classes,
    accuracies,
    sensitivities,
    specificities,
    macroAuroc,
    overallAccuracy,
  };
}
