/**
 * Unit tests for Safe CSV generation and formula injection defense (csv.ts)
 */
import { describe, expect, it } from 'vitest';
import { sanitizeCsvCell, toCsvString } from '../lib/csv';

describe('Safe CSV Generation (csv.ts)', () => {
  it('neutralizes dangerous formula injection characters (=, +, -, @)', () => {
    expect(sanitizeCsvCell('=1+1')).toBe(`"'=1+1"`);
    expect(sanitizeCsvCell('+cmd|calc')).toBe(`"'+cmd|calc"`);
    expect(sanitizeCsvCell('-2')).toBe(`"'-2"`);
    expect(sanitizeCsvCell('@test')).toBe(`"'@test"`);
  });

  it('escapes internal quotes properly by doubling them', () => {
    expect(sanitizeCsvCell('Normal "CXR" scan')).toBe(`"Normal ""CXR"" scan"`);
  });

  it('formats entire CSV with CRLF line breaks', () => {
    const headers = ['Name', 'Score'];
    const rows = [
      ['Scan A', 0.5],
      ['Scan B', 1.2],
    ];
    const csv = toCsvString(headers, rows);
    expect(csv).toBe('"Name","Score"\r\n"Scan A","0.5"\r\n"Scan B","1.2"');
  });

  it('handles null and undefined cell values safely', () => {
    expect(sanitizeCsvCell(null)).toBe('""');
    expect(sanitizeCsvCell(undefined)).toBe('""');
  });
});
