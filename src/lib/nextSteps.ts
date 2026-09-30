/**
 * @license
 * SPDX-License-Identifier: MIT
 * Conservative clinical action guidance based on screening results
 */

import { FusionResult } from './fusion';
import { VerdictLabel } from './verdict';

export interface NextStepsGuidance {
  primaryMessage: string;
  actionItems: string[];
  urgency: 'routine' | 'review' | 'urgent';
}

/**
 * Returns conservative public-health oriented next steps
 */
export function getNextSteps(
  verdict: VerdictLabel,
  borderline: boolean,
  gatePassed: boolean,
  fusionResult?: FusionResult
): NextStepsGuidance {
  if (!gatePassed) {
    return {
      primaryMessage: 'Input scan could not be evaluated reliably.',
      actionItems: [
        'Upload a clear grayscale chest X-ray taken under standard diagnostic protocol.',
        'Avoid uploading color photographs, selfies, or non-chest scans.',
        'Ensure the image is well-focused and not blurred.',
      ],
      urgency: 'routine',
    };
  }

  if (borderline) {
    return {
      primaryMessage: 'Borderline score detected near decision boundary.',
      actionItems: [
        'Present this screening summary to a qualified physician or radiologist for direct evaluation.',
        'Do not make any treatment decisions based on borderline screening alone.',
        'If symptoms such as fever, cough, or breathlessness are present, seek medical attention regardless of score.',
      ],
      urgency: 'review',
    };
  }

  if (verdict === 'Refer') {
    return {
      primaryMessage: 'Unusual imaging pattern identified in the top 1% percentile.',
      actionItems: [
        'Arrange a clinical consultation with a doctor or chest specialist as soon as practicable.',
        'Bring the original scan and the ScanKavach summary report to your appointment.',
        'If you experience acute breathlessness or chest pain, seek immediate emergency care.',
      ],
      urgency: 'urgent',
    };
  }

  if (verdict === 'Review') {
    return {
      primaryMessage: 'Pattern shows moderate variation from healthy reference baseline.',
      actionItems: [
        'Ask a qualified clinician to review this scan in the context of your overall medical history.',
        'Bring a printed or digital copy of the screening report.',
        'Monitor for symptoms such as persistent cough, fever, or fatigue.',
      ],
      urgency: 'review',
    };
  }

  // Normal verdict
  const normalActions = [
    'No unusual pattern detected relative to the healthy reference set.',
    'Screening decision support does not replace formal clinical assessment.',
    'Consult a doctor if you experience persistent cough (over 2 weeks), unexplained fever, or chest pain.',
  ];

  if (fusionResult && fusionResult.outcome === 'Conflict') {
    return {
      primaryMessage: 'Conflicting signals between anomaly detection and classifier.',
      actionItems: [
        'Clinician review is recommended to reconcile the conflicting indicators.',
        ...normalActions.slice(1),
      ],
      urgency: 'review',
    };
  }

  return {
    primaryMessage: 'Pattern falls within the expected healthy baseline.',
    actionItems: normalActions,
    urgency: 'routine',
  };
}
