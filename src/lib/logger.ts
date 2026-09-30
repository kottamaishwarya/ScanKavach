/**
 * @license
 * SPDX-License-Identifier: MIT
 * Typed logger silent in production environments
 */

const isProd = process.env.NODE_ENV === 'production';

export const logger = {
  debug: (...args: unknown[]) => {
    if (!isProd) {
      // Intentionally guarded by debug environment
      // eslint-disable-next-line no-console
      console.debug('[ScanKavach:debug]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (!isProd) {
      // eslint-disable-next-line no-console
      console.info('[ScanKavach:info]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn('[ScanKavach:warn]', ...args);
  },
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error('[ScanKavach:error]', ...args);
  },
};

/**
 * Result pattern for safe functional error handling
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
