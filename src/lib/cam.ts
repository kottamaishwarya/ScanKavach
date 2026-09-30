/**
 * @license
 * SPDX-License-Identifier: MIT
 * Class Activation Mapping (CAM) generator
 */

/**
 * Computes CAM map from 14x14 spatial feature maps and classifier weights
 */
export function computeClassActivationMap(
  spatialFeatures: number[][], // 196 vectors (14x14), each length D
  classWeights: number[], // length D for the target class
  gridDim = 14
): number[] {
  if (!spatialFeatures || spatialFeatures.length === 0 || !classWeights || classWeights.length === 0) {
    return new Array(gridDim * gridDim).fill(0);
  }

  const scores: number[] = new Array(spatialFeatures.length);
  let minVal = Infinity;
  let maxVal = -Infinity;

  for (let i = 0; i < spatialFeatures.length; i++) {
    const feat = spatialFeatures[i];
    let dot = 0;
    const len = Math.min(feat.length, classWeights.length);
    for (let d = 0; d < len; d++) {
      dot += feat[d] * classWeights[d];
    }
    // ReLU activation: only positive contribution to the class
    const val = Math.max(0, dot);
    scores[i] = val;
    if (val < minVal) minVal = val;
    if (val > maxVal) maxVal = val;
  }

  // Normalize to [0, 1]
  const range = maxVal - minVal;
  if (range <= 1e-6) {
    return scores.map(() => 0.5);
  }

  return scores.map((s) => (s - minVal) / range);
}

/**
 * Upsamples a 14x14 grid to 224x224 canvas image data with bilinear interpolation
 */
export function renderCamToImageData(
  camScores: number[],
  gridDim = 14,
  targetDim = 224
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = targetDim;
  canvas.height = targetDim;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(targetDim, targetDim);
  const data = imgData.data;

  const scale = (gridDim - 1) / targetDim;

  for (let y = 0; y < targetDim; y++) {
    const gy = y * scale;
    const y0 = Math.floor(gy);
    const y1 = Math.min(gridDim - 1, y0 + 1);
    const wy = gy - y0;

    for (let x = 0; x < targetDim; x++) {
      const gx = x * scale;
      const x0 = Math.floor(gx);
      const x1 = Math.min(gridDim - 1, x0 + 1);
      const wx = gx - x0;

      const v00 = camScores[y0 * gridDim + x0] || 0;
      const v10 = camScores[y0 * gridDim + x1] || 0;
      const v01 = camScores[y1 * gridDim + x0] || 0;
      const v11 = camScores[y1 * gridDim + x1] || 0;

      const interp =
        (1 - wx) * (1 - wy) * v00 +
        wx * (1 - wy) * v10 +
        (1 - wx) * wy * v01 +
        wx * wy * v11;

      const pixelIdx = (y * targetDim + x) * 4;
      // Colormap Jet-like: red for hot, yellow for mid, transparent blue for cold
      data[pixelIdx] = Math.round(interp * 255); // R
      data[pixelIdx + 1] = Math.round((1 - Math.abs(interp - 0.5) * 2) * 255); // G
      data[pixelIdx + 2] = Math.round((1 - interp) * 200); // B
      data[pixelIdx + 3] = Math.round(interp * 180); // Alpha
    }
  }

  return imgData;
}
