/**
 * @license
 * SPDX-License-Identifier: MIT
 * ScanKavach - Central Application Configuration
 */

export const APP_NAME = 'ScanKavach' as const;
export const APP_ID = 'scankavach' as const;
export const APP_FULL_TITLE =
  'ScanKavach: Label-Free Anomaly Screening and Decision Support for Medical Images' as const;
export const APP_TAGLINE = 'Your shield for safer medical image screening' as const;

// Image dimensions & Model
export const IMG_SIZE = 224;
export const PATCH_LAYER = 'conv_pw_11_relu';
export const MOBILENET_MODEL_URL =
  'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';

// Memory Bank Configuration
export const MAX_BANK_PATCHES = 8000;
export const BANK_FRACTION = 0.7;
export const MAX_THUMBNAILS = 100;
export const THUMB_SIZE = 128;
export const TOPK_PATCHES = 3;
export const MIN_NORMALS = 20;
export const RECOMMENDED_NORMALS = 60;

// Calibration & Verdict
export const REVIEW_PERCENTILE = 95;
export const REFER_PERCENTILE = 99;
export const BORDERLINE_MARGIN = 0.05; // 5% relative window around threshold

// Safety Gate Limits
export const COLOR_DIFF_LIMIT = 12;
export const DEFAULT_BLUR_LIMIT = 15;
export const MIN_CONTRAST_STD = 0.05;
export const OOD_MARGIN = 1.5;
export const MAX_UPLOAD_MB = 15;

// Scanner Shift Detection
export const SHIFT_LIMIT = 2.0;

// Condition Classifier & Fusion
export const CLASS_MIN_IMAGES = 30;
export const CLASS_RECOMMENDED_IMAGES = 200;
export const TRAIN_SPLIT = 0.8;
export const EPOCHS = 80;
export const LEARNING_RATE = 0.01;
export const MIN_CONFIDENCE = 0.6;
export const HIGH_CONFIDENCE = 0.85;
export const DISAGREEMENT_PROB = 0.7;

// Limits & App Settings
export const HISTORY_LIMIT = 500;
export const BATCH_LIMIT = 50;
export const GEMINI_MODEL = 'gemini-2.5-flash';
export const AUTH_EXPIRY_HOURS = 8;
export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_SECONDS = 30;
