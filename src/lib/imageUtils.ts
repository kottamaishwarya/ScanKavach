/**
 * @license
 * SPDX-License-Identifier: MIT
 * Image processing utilities: resizing, format validation, canvas redrawing, and quality metrics
 */

import { IMG_SIZE, MAX_UPLOAD_MB } from '../config';

export interface ImageQualityMetrics {
  colorDiff: number;
  contrastStd: number;
  laplacianVariance: number;
  meanIntensity: number;
}

/**
 * Validates file format and file size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload PNG, JPG, or WEBP images only.',
    };
  }

  const maxBytes = MAX_UPLOAD_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds the ${MAX_UPLOAD_MB}MB upload limit.`,
    };
  }

  return { valid: true };
}

/**
 * Strips EXIF/metadata and returns an HTMLImageElement
 */
export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Corrupt or unreadable image file.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Computes color difference, contrast standard deviation, and mean intensity from RGBA pixels
 */
export function computeColorAndContrast(
  rgba: Uint8ClampedArray,
  width: number,
  height: number
): { colorDiff: number; contrastStd: number; meanIntensity: number } {
  const totalPixels = width * height;
  if (totalPixels === 0) {
    return { colorDiff: 0, contrastStd: 0, meanIntensity: 0 };
  }

  let totalDiff = 0;
  let graySum = 0;
  const grays: number[] = new Array(totalPixels);

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const r = rgba[idx];
    const g = rgba[idx + 1];
    const b = rgba[idx + 2];

    const diff = (Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r)) / 3;
    totalDiff += diff;

    // Luminance grayscale
    const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    grays[i] = gray;
    graySum += gray;
  }

  const meanIntensity = graySum / totalPixels;
  let varianceSum = 0;
  for (let i = 0; i < totalPixels; i++) {
    const d = grays[i] - meanIntensity;
    varianceSum += d * d;
  }

  const contrastStd = Math.sqrt(varianceSum / totalPixels);
  const colorDiff = totalDiff / totalPixels;

  return { colorDiff, contrastStd, meanIntensity };
}

/**
 * Computes discrete Laplacian variance on a grayscale 2D array
 */
export function computeLaplacianVariance(
  grays: Float32Array | number[],
  width: number,
  height: number
): number {
  if (width < 3 || height < 3) return 0;

  let sum = 0;
  let sumSq = 0;
  let count = 0;

  // 3x3 discrete kernel: [0, 1, 0; 1, -4, 1; 0, 1, 0]
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const c = grays[y * width + x];
      const up = grays[(y - 1) * width + x];
      const down = grays[(y + 1) * width + x];
      const left = grays[y * width + (x - 1)];
      const right = grays[y * width + (x + 1)];

      const lap = up + down + left + right - 4 * c;
      sum += lap;
      sumSq += lap * lap;
      count++;
    }
  }

  if (count === 0) return 0;
  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  return Math.max(0, variance * 10000); // scaled for numerical stability
}

/**
 * Extracts quality metrics from an HTML canvas or image element
 */
export function extractImageQualityMetrics(
  source: HTMLImageElement | HTMLCanvasElement,
  targetDim = IMG_SIZE
): ImageQualityMetrics {
  const canvas = document.createElement('canvas');
  canvas.width = targetDim;
  canvas.height = targetDim;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, 0, 0, targetDim, targetDim);

  const imgData = ctx.getImageData(0, 0, targetDim, targetDim);
  const { colorDiff, contrastStd, meanIntensity } = computeColorAndContrast(
    imgData.data,
    targetDim,
    targetDim
  );

  // Extract grayscale array for Laplacian
  const totalPixels = targetDim * targetDim;
  const grays = new Float32Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    grays[i] =
      (0.299 * imgData.data[idx] +
        0.587 * imgData.data[idx + 1] +
        0.114 * imgData.data[idx + 2]) /
      255;
  }

  const laplacianVariance = computeLaplacianVariance(grays, targetDim, targetDim);

  return {
    colorDiff,
    contrastStd,
    laplacianVariance,
    meanIntensity,
  };
}

/**
 * Creates a normalized base64 thumbnail of a canvas/image
 */
export function createThumbnailUrl(
  source: HTMLImageElement | HTMLCanvasElement,
  size = 128
): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, 0, 0, size, size);
  return canvas.toDataURL('image/jpeg', 0.85);
}
