/**
 * @license
 * SPDX-License-Identifier: MIT
 * CSV helper with formula injection protection (neutralising =, +, -, @)
 */

/**
 * Escapes a single CSV cell value to prevent formula injection
 * and properly format quotes and commas.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  // Neutralize CSV formula injection risk: prefix dangerous leading characters with a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape internal double quotes by doubling them
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Converts a list of records to a safe CSV string
 */
export function toCsvString(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerLine = headers.map(sanitizeCsvCell).join(',');
  const rowLines = rows.map((row) => row.map(sanitizeCsvCell).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}
