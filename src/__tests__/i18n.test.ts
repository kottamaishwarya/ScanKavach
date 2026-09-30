/**
 * Unit tests for Multilingual Engine (i18n.ts)
 */
import { describe, expect, it } from 'vitest';
import { SupportedLanguage, t, TRANSLATIONS } from '../lib/i18n';

describe('Multilingual Translation (i18n.ts)', () => {
  const languages: SupportedLanguage[] = ['en', 'te', 'hi'];

  it('guarantees every English key exists in Telugu and Hindi', () => {
    const enKeys = Object.keys(TRANSLATIONS.en);
    for (const lang of languages) {
      const langKeys = Object.keys(TRANSLATIONS[lang]);
      for (const k of enKeys) {
        expect(
          langKeys.includes(k),
          `Missing key "${k}" in language "${lang}"`
        ).toBe(true);
        expect(TRANSLATIONS[lang][k].trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('translates core navigation and verdict keys accurately', () => {
    expect(t('verdictNormal', 'en')).toBe('Normal');
    expect(t('verdictNormal', 'te')).toContain('సాధారణం');
    expect(t('verdictNormal', 'hi')).toContain('सामान्य');
  });

  it('falls back cleanly to English if key missing', () => {
    expect(t('non_existent_key_12345', 'te')).toBe('non_existent_key_12345');
  });
});
