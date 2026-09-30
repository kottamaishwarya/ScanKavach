/**
 * @license
 * SPDX-License-Identifier: MIT
 * Condition suggestion inference and model storage
 */

import { ClassProbability } from './fusion';
import { logger } from './logger';
import { validateModelJson, ValidatedModelJson } from './schema';

export interface ConditionModelData extends ValidatedModelJson {
  id: string;
  name: string;
  createdAt: string;
}

let loadedModel: ConditionModelData | null = null;

export function getLoadedConditionModel(): ConditionModelData | null {
  if (loadedModel) return loadedModel;
  try {
    const raw = localStorage.getItem('scankavach_condition_model');
    if (raw) {
      loadedModel = JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return loadedModel;
}

export function setLoadedConditionModel(model: ConditionModelData | null): void {
  loadedModel = model;
  try {
    if (model) {
      localStorage.setItem('scankavach_condition_model', JSON.stringify(model));
    } else {
      localStorage.removeItem('scankavach_condition_model');
    }
  } catch (err) {
    logger.warn('Failed saving condition model to localStorage', err);
  }
}

/**
 * Predicts class probabilities given a global embedding vector
 */
export function predictCondition(
  embedding: number[],
  model: ConditionModelData
): ClassProbability[] {
  const { classes, weights, biases, temperature } = model;
  const numClasses = classes.length;
  const d = embedding.length;

  const logits: number[] = new Array(numClasses).fill(0);

  for (let c = 0; c < numClasses; c++) {
    let dot = biases[c] || 0;
    for (let i = 0; i < d; i++) {
      dot += embedding[i] * (weights[i]?.[c] ?? 0);
    }
    logits[c] = dot / Math.max(0.01, temperature);
  }

  // Softmax
  const maxLogit = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - maxLogit));
  const sumExp = exps.reduce((acc, v) => acc + v, 0);

  return classes.map((className, idx) => ({
    className,
    probability: Math.round((exps[idx] / sumExp) * 1000) / 1000,
  }));
}

export function importConditionModel(jsonString: string): ConditionModelData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Malformed JSON string.');
  }

  const res = validateModelJson(parsed);
  if (!res.ok) {
    throw new Error(res.error);
  }

  const model: ConditionModelData = {
    ...res.value,
    id: `model-${Date.now()}`,
    name: `Classifier-${new Date().toISOString().slice(0, 10)}`,
    createdAt: new Date().toISOString(),
  };

  setLoadedConditionModel(model);
  return model;
}

export function exportConditionModelJson(model: ConditionModelData): string {
  return JSON.stringify(model, null, 2);
}
