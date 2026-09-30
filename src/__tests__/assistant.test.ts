/**
 * Unit tests for Assistant & Safety Bounds (assistant.ts)
 */
import { describe, expect, it } from 'vitest';
import {
  checkSafetyViolation,
  getLocalAssistantResponse,
  queryAssistant,
} from '../lib/assistant';

describe('Assistant & Safety Guardrails (assistant.ts)', () => {
  it('triggers safety violation for diagnostic inquiries', () => {
    expect(checkSafetyViolation('Do I have pneumonia?')).toBe(true);
    expect(checkSafetyViolation('Can you diagnose me?')).toBe(true);
    expect(checkSafetyViolation('Am I sick?')).toBe(true);
  });

  it('triggers safety violation for medicine or dosage inquiries', () => {
    expect(checkSafetyViolation('What medicine should I take for this cough?')).toBe(true);
    expect(checkSafetyViolation('What is the dose for amoxicillin?')).toBe(true);
    expect(checkSafetyViolation('What dosage do I need?')).toBe(true);
    expect(checkSafetyViolation('How many pills a day?')).toBe(true);
    expect(checkSafetyViolation('Is there a home remedy or home cure?')).toBe(true);
    expect(checkSafetyViolation('Can you prescribe an antibiotic?')).toBe(true);
  });

  it('provides polite refusal for unsafe queries', () => {
    const res = getLocalAssistantResponse('What medicine should I take?');
    expect(res).toContain('cannot provide a personal diagnosis');
    expect(res).toContain('consult a qualified doctor');
  });

  it('answers screening question about borderline scores safely', () => {
    const res = getLocalAssistantResponse('What does borderline mean?');
    expect(res).toContain('Borderline');
    expect(res).toContain('5% of a triage threshold');
  });

  it('answers tuberculosis queries accurately highlighting NTEP without prescribing', () => {
    const res = getLocalAssistantResponse('Is TB curable?');
    expect(res).toContain('Tuberculosis');
    expect(res).toContain('curable');
    expect(res).toContain('National TB Elimination Programme');
  });

  it('works in offline mode without API key', async () => {
    const res = await queryAssistant('How do I get a better scan?', null);
    expect(res).toContain('DICOM');
    expect(res).toContain('grayscale');
  });
});
