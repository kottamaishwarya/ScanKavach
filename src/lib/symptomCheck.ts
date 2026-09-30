/**
 * @license
 * SPDX-License-Identifier: MIT
 * Symptom Triage Questionnaire
 * Evaluates symptoms without diagnosing or providing medicine advice.
 */

export interface SymptomAnswers {
  coughOverTwoWeeks: boolean;
  fever: boolean;
  nightSweats: boolean;
  unexplainedWeightLoss: boolean;
  bloodInSputum: boolean;
  chestPain: boolean;
  difficultyBreathingAtRest: boolean;
  blueLipsOrConfusion: boolean;
  tbContact: boolean;
  smoker: boolean;
  ageVulnerable: boolean; // over 60 or under 5
  chronicIllness: boolean;
}

export type TriageUrgency =
  | 'Seek urgent care now'
  | 'See a doctor soon'
  | 'Routine - maintain healthy habits';

export interface SymptomTriageResult {
  urgency: TriageUrgency;
  reasons: string[];
  recommendations: string[];
}

/**
 * Pure rule-based symptom triage function (zero disease names in verdict)
 */
export function triageSymptoms(answers: SymptomAnswers): SymptomTriageResult {
  const reasons: string[] = [];

  // Urgent criteria
  const isUrgent =
    answers.difficultyBreathingAtRest ||
    answers.blueLipsOrConfusion ||
    (answers.bloodInSputum && answers.chestPain);

  if (answers.difficultyBreathingAtRest) {
    reasons.push('Difficulty breathing at rest requires urgent medical evaluation.');
  }
  if (answers.blueLipsOrConfusion) {
    reasons.push('Signs of low oxygen saturation or altered consciousness require immediate emergency care.');
  }
  if (answers.bloodInSputum && answers.chestPain) {
    reasons.push('Blood in sputum accompanied by chest pain warrants rapid hospital assessment.');
  }

  if (isUrgent) {
    return {
      urgency: 'Seek urgent care now',
      reasons,
      recommendations: [
        'Visit the nearest emergency department or call emergency services (112 in India).',
        'Avoid physical exertion and keep airways clear.',
        'Do not wait for non-emergency clinic appointments.',
      ],
    };
  }

  // Soon criteria
  const hasTbSymptoms =
    answers.coughOverTwoWeeks ||
    (answers.fever && answers.coughOverTwoWeeks) ||
    (answers.nightSweats && answers.unexplainedWeightLoss) ||
    answers.bloodInSputum ||
    (answers.tbContact && (answers.fever || answers.coughOverTwoWeeks || answers.unexplainedWeightLoss));

  if (answers.coughOverTwoWeeks) {
    reasons.push('Cough lasting more than two weeks should be evaluated by a healthcare professional.');
  }
  if (answers.bloodInSputum) {
    reasons.push('Coughing up blood requires clinical diagnostic follow-up.');
  }
  if (answers.nightSweats && answers.unexplainedWeightLoss) {
    reasons.push('Unexplained weight loss coupled with night sweats indicates the need for formal screening.');
  }
  if (answers.tbContact) {
    reasons.push('Close contact with a diagnosed patient warrants proactive clinical testing.');
  }

  if (hasTbSymptoms || answers.chestPain) {
    return {
      urgency: 'See a doctor soon',
      reasons,
      recommendations: [
        'Book an appointment with a primary care doctor or chest physician this week.',
        'Wear a mask when around others in crowded indoor spaces as a precaution.',
        'Bring notes regarding symptom duration and prior health conditions.',
      ],
    };
  }

  // Routine
  return {
    urgency: 'Routine - maintain healthy habits',
    reasons: ['No acute or persistent high-risk symptoms reported.'],
    recommendations: [
      'Maintain balanced nutrition, adequate hydration, and active habits.',
      'Stay current on recommended vaccinations.',
      'Seek prompt medical advice if new or worsening respiratory symptoms develop.',
    ],
  };
}
