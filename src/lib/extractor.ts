/**
 * @license
 * SPDX-License-Identifier: MIT
 * Lazy-loaded MobileNet v1 0.25 feature extractor
 */

import { IMG_SIZE, MOBILENET_MODEL_URL, PATCH_LAYER } from '../config';
import { logger } from './logger';

export interface ExtractedFeatures {
  patchFeatures: number[][]; // 196 vectors (14x14)
  globalEmbedding: number[]; // D-dimensional average pooled vector
  featureDim: number;
}

// Singleton state
let tfInstance: typeof import('@tensorflow/tfjs') | null = null;
let modelPromise: Promise<any> | null = null;
let featureModel: any = null;
let modelLoadingError: string | null = null;

export async function getTf(): Promise<typeof import('@tensorflow/tfjs')> {
  if (!tfInstance) {
    tfInstance = await import('@tensorflow/tfjs');
    try {
      await tfInstance.setBackend('webgl');
      await tfInstance.ready();
    } catch {
      logger.warn('WebGL failed, falling back to CPU backend');
      await tfInstance.setBackend('cpu');
      await tfInstance.ready();
    }
  }
  return tfInstance;
}

export function getModelLoadingError(): string | null {
  return modelLoadingError;
}

export async function loadFeatureExtractor(
  onProgress?: (fraction: number) => void
): Promise<any> {
  if (featureModel) return featureModel;
  if (modelPromise) return modelPromise;

  modelPromise = (async () => {
    try {
      const tf = await getTf();
      onProgress?.(0.2);

      const baseModel = await tf.loadLayersModel(MOBILENET_MODEL_URL, {
        onProgress: (p) => onProgress?.(0.2 + p * 0.6),
      });

      // Find target intermediate layer (conv_pw_11_relu has 14x14 spatial feature maps)
      let targetLayer = baseModel.layers.find((l) => l.name === PATCH_LAYER);
      if (!targetLayer) {
        // Fallback: search for last layer with 14x14 spatial output shape
        targetLayer = baseModel.layers
          .slice()
          .reverse()
          .find((l) => {
            const shape = l.outputShape as number[];
            return Array.isArray(shape) && shape.length === 4 && shape[1] === 14 && shape[2] === 14;
          });
      }

      if (!targetLayer) {
        throw new Error(`Target feature layer '${PATCH_LAYER}' not found in loaded model.`);
      }

      featureModel = tf.model({
        inputs: baseModel.inputs,
        outputs: targetLayer.output,
      });

      // Warm up with dummy prediction
      tf.tidy(() => {
        const dummy = tf.zeros([1, IMG_SIZE, IMG_SIZE, 3]);
        featureModel.predict(dummy);
      });

      onProgress?.(1.0);
      modelLoadingError = null;
      return featureModel;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      modelLoadingError = msg;
      logger.error('Failed to load feature extractor:', msg);
      modelPromise = null;
      throw new Error(`Failed to load neural feature extractor: ${msg}`);
    }
  })();

  return modelPromise;
}

/**
 * Extracts patch feature maps and global embedding from an image or canvas
 */
export async function extractFeatures(
  source: HTMLImageElement | HTMLCanvasElement
): Promise<ExtractedFeatures> {
  const tf = await getTf();
  const model = await loadFeatureExtractor();

  return tf.tidy(() => {
    // 1. Convert to tensor from pixels
    let tensor = tf.browser.fromPixels(source);

    // 2. Resize to 224x224
    if (tensor.shape[0] !== IMG_SIZE || tensor.shape[1] !== IMG_SIZE) {
      tensor = tf.image.resizeBilinear(tensor, [IMG_SIZE, IMG_SIZE]);
    }

    // 3. Cast to float32 and scale to [-1, 1]
    const normalized = tensor
      .toFloat()
      .div(tf.scalar(127.5))
      .sub(tf.scalar(1.0))
      .expandDims(0); // [1, 224, 224, 3]

    // 4. Predict intermediate feature map [1, 14, 14, D]
    const featMap = model.predict(normalized) as import('@tensorflow/tfjs').Tensor4D;
    const [, h, w, d] = featMap.shape;

    // Reshape to [196, D]
    const reshaped = featMap.reshape([h * w, d]);
    const patchData = reshaped.arraySync() as number[][];

    // Compute global embedding: mean over patches [D]
    const globalTensor = reshaped.mean(0);
    const globalData = Array.from(globalTensor.dataSync());

    return {
      patchFeatures: patchData,
      globalEmbedding: globalData,
      featureDim: d,
    };
  });
}
