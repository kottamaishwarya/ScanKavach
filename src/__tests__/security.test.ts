/**
 * Security & Secret Hygiene Tests (security.test.ts)
 */
import { describe, expect, it } from 'vitest';
import {
  HEALTH_CONDITIONS,
  HEALTH_DISCLAIMER,
  HEALTH_SOURCES_NOTE,
} from '../data/healthContent';
import { TRANSLATIONS } from '../lib/i18n';
import { computeColorAndContrast, computeLaplacianVariance } from '../lib/imageUtils';

describe('Security, Secret Hygiene & Clinical Wording (security.test.ts)', () => {
  it('guarantees health content contains zero diagnostic claims', () => {
    const rawContent = JSON.stringify(HEALTH_CONDITIONS).toLowerCase();

    // Must not state active individual diagnosis or unverified cure
    expect(rawContent).not.toContain('you have pneumonia');
    expect(rawContent).not.toContain('you have tuberculosis');
    expect(rawContent).not.toContain('you are cured');
    expect(rawContent).not.toContain('diagnosed with pneumonia');
  });

  it('guarantees translation tables contain zero prohibited diagnostic phrases', () => {
    const textEn = JSON.stringify(TRANSLATIONS.en).toLowerCase();
    expect(textEn).not.toContain('you have');
    expect(textEn).not.toContain('you are diagnosed with');
    expect(textEn).not.toContain('fully cured');
  });

  it('verifies mandatory disclaimers and source attributions exist', () => {
    expect(HEALTH_DISCLAIMER.toLowerCase()).toContain('not a diagnosis');
    expect(HEALTH_SOURCES_NOTE).toContain('WHO');
    expect(HEALTH_SOURCES_NOTE).toContain('ICMR');
  });

  it('computes image quality and laplacian variance accurately', () => {
    const pixels = new Uint8ClampedArray(16 * 4); // 4x4
    for (let i = 0; i < 16; i++) {
      pixels[i * 4] = 100;
      pixels[i * 4 + 1] = 100;
      pixels[i * 4 + 2] = 100;
      pixels[i * 4 + 3] = 255;
    }
    const q = computeColorAndContrast(pixels, 4, 4);
    expect(q.colorDiff).toBe(0);
    expect(q.contrastStd).toBeCloseTo(0, 5);

    const grays = new Float32Array([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
    const lap = computeLaplacianVariance(grays, 3, 3);
    expect(lap).toBe(0);
  });
});
