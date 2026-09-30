/**
 * Unit tests for Symptom Triage Questionnaire (symptomCheck.ts)
 */
import { describe, expect, it } from 'vitest';
import { SymptomAnswers, triageSymptoms } from '../lib/symptomCheck';

describe('Symptom Triage Questionnaire (symptomCheck.ts)', () => {
  const baseAnswers: SymptomAnswers = {
    coughOverTwoWeeks: false,
    fever: false,
    nightSweats: false,
    unexplainedWeightLoss: false,
    bloodInSputum: false,
    chestPain: false,
    difficultyBreathingAtRest: false,
    blueLipsOrConfusion: false,
    tbContact: false,
    smoker: false,
    ageVulnerable: false,
    chronicIllness: false,
  };

  it('triages acute breathing difficulty as "Seek urgent care now"', () => {
    const res = triageSymptoms({
      ...baseAnswers,
      difficultyBreathingAtRest: true,
    });
    expect(res.urgency).toBe('Seek urgent care now');
    expect(res.recommendations).toContain('Visit the nearest emergency department or call emergency services (112 in India).');
  });

  it('triages chronic cough over 2 weeks as "See a doctor soon"', () => {
    const res = triageSymptoms({
      ...baseAnswers,
      coughOverTwoWeeks: true,
    });
    expect(res.urgency).toBe('See a doctor soon');
  });

  it('triages asymptomatic case as "Routine - maintain healthy habits"', () => {
    const res = triageSymptoms(baseAnswers);
    expect(res.urgency).toBe('Routine - maintain healthy habits');
  });

  it('guarantees zero disease names appear in triage results', () => {
    const res = triageSymptoms({
      ...baseAnswers,
      coughOverTwoWeeks: true,
      fever: true,
      bloodInSputum: true,
    });
    const combinedText = `${res.urgency} ${res.reasons.join(' ')} ${res.recommendations.join(' ')}`.toLowerCase();
    expect(combinedText).not.toContain('pneumonia');
    expect(combinedText).not.toContain('tuberculosis');
    expect(combinedText).not.toContain('cancer');
  });
});
