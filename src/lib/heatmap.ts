/**
 * @license
 * SPDX-License-Identifier: MIT
 * Anomaly Heatmap rendering with smooth jet/turbo colormap
 */

/**
 * Renders a 14x14 patch score array to an RGBA ImageData overlay
 */
export function renderHeatmapToImageData(
  patchScores: number[],
  minVal: number,
  maxVal: number,
  gridDim = 14,
  targetDim = 224,
  alpha = 0.5
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = targetDim;
  canvas.height = targetDim;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(targetDim, targetDim);
  const data = imgData.data;

  const range = maxVal - minVal > 1e-5 ? maxVal - minVal : 1;
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

      const v00 = patchScores[y0 * gridDim + x0] || 0;
      const v10 = patchScores[y0 * gridDim + x1] || 0;
      const v01 = patchScores[y1 * gridDim + x0] || 0;
      const v11 = patchScores[y1 * gridDim + x1] || 0;

      const interp =
        (1 - wx) * (1 - wy) * v00 +
        wx * (1 - wy) * v10 +
        (1 - wx) * wy * v01 +
        wx * wy * v11;

      const norm = Math.max(0, Math.min(1, (interp - minVal) / range));
      const pixelIdx = (y * targetDim + x) * 4;

      // Colormap Jet-like
      data[pixelIdx] = Math.round(norm * 255); // R
      data[pixelIdx + 1] = Math.round((1 - Math.abs(norm - 0.5) * 2) * 255); // G
      data[pixelIdx + 2] = Math.round((1 - norm) * 230); // B
      data[pixelIdx + 3] = Math.round(norm * 255 * alpha); // A
    }
  }

  return imgData;
}
