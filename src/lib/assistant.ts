/**
 * @license
 * SPDX-License-Identifier: MIT
 * AI Assistant with local offline fallback and optional runtime-provided Gemini key
 */

import { GEMINI_MODEL } from '../config';
import { HEALTH_CONDITIONS } from '../data/healthContent';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface AssistantContext {
  verdict?: string;
  score?: number;
  percentile?: number;
  borderline?: boolean;
  gatePassed?: boolean;
  gateReason?: string;
  suggestion?: string;
  suggestedConfidence?: number;
  fusionOutcome?: string;
  hasShift?: boolean;
  reliability?: string;
}

export const SUGGESTED_QUESTIONS = [
  'Why was my scan flagged?',
  'What does Borderline mean?',
  'How do I get a better scan?',
  'How can I prevent lung infections?',
  'When should I see a doctor for a cough?',
  'What is TB and is it curable?',
  'Explain the thresholds',
];

const SAFE_REFUSAL =
  'I cannot provide a personal diagnosis, evaluate individual disease status, or recommend medicines, dosages, home cures, or treatment plans. ScanKavach is an assistive screening research tool, not a diagnostic medical device. Please consult a qualified doctor or pulmonologist for clinical evaluation and personalized care.';

/**
 * Checks if question breaches safety bounds (diagnosing, medicines, doses, home cures)
 */
export function checkSafetyViolation(query: string): boolean {
  const q = query.toLowerCase();
  const dangerousPatterns = [
    /do i have\b/,
    /\bam i sick\b/,
    /\bdiagnose\b/,
    /\bmedicine\b/,
    /\bdose\b/,
    /\bdosage\b/,
    /\bmg\b/,
    /\bpills\b/,
    /\bhome cure\b/,
    /\bhome remedy\b/,
    /\btreatment plan\b/,
    /\bprescribe\b/,
    /\bantibiotic\b/,
  ];

  return dangerousPatterns.some((p) => p.test(q));
}

/**
 * Local rule-based engine providing instant answers without network calls
 */
export function getLocalAssistantResponse(query: string, context?: AssistantContext): string {
  if (checkSafetyViolation(query)) {
    return SAFE_REFUSAL;
  }

  const q = query.toLowerCase();

  if (q.includes('why') && (q.includes('flagged') || q.includes('review') || q.includes('refer'))) {
    if (context?.verdict === 'Review' || context?.verdict === 'Refer') {
      return `Your scan was marked as "${context.verdict}" because its patch anomaly score (${context.score ?? 'elevated'}) exceeded calibrated percentiles of healthy reference scans. The system identified patterns that differ from normal tissue baselines. Remember: this is not a diagnosis, but a screening flag for human clinician review.`;
    }
    return 'Scans are flagged when local patch textures diverge from healthy baseline scans in the reference bank. Scores above the 95th percentile trigger a Review flag, and those above the 99th percentile trigger a Refer flag for prompt clinician attention.';
  }

  if (q.includes('borderline')) {
    return 'A "Borderline" flag indicates the scan score is within 5% of a triage threshold boundary. Because biological variation is continuous, borderline scores have higher uncertainty and specifically require human clinician inspection rather than automated categorisation.';
  }

  if (q.includes('better scan') || q.includes('quality') || q.includes('upload')) {
    return 'For optimal screening: (1) Use original standard DICOM-exported grayscale radiographs; (2) Avoid photographing monitor screens with a smartphone; (3) Ensure proper patient positioning without rotation or motion blur; (4) Verify that the entire thoracic cage and costophrenic angles are visible.';
  }

  if (q.includes('prevent') || q.includes('infection')) {
    return 'Key preventive measures include: staying up to date with vaccines (Pneumococcal, Flu, COVID-19), practicing regular hand hygiene, avoiding active and second-hand tobacco smoke, ensuring kitchen ventilation when using cooking fuels, and maintaining a balanced, nutrient-rich diet.';
  }

  if (q.includes('doctor') || q.includes('cough')) {
    return 'You should see a doctor promptly if a cough persists beyond 2 weeks, or sooner if accompanied by high fever, blood in sputum, shortness of breath, unexplained weight loss, or persistent chest discomfort.';
  }

  if (q.includes('tb') || q.includes('tuberculosis')) {
    const tb = HEALTH_CONDITIONS.find((c) => c.id === 'tuberculosis');
    return `Tuberculosis (TB) is a bacterial infection primarily affecting the lungs. Yes, TB is fully curable with a standard, supervised course of antibiotics. In India, free testing and medications are provided across the country through the National TB Elimination Programme (NTEP). Please visit the Health Hub for more details.`;
  }

  if (q.includes('threshold') || q.includes('percentile')) {
    return 'ScanKavach uses empirical percentiles from a held-out healthy validation set: the 95th percentile forms the Review threshold (~5% of healthy scans naturally land here by design), and the 99th percentile forms the Refer threshold (top 1% most unusual). Thresholds are calibrated mathematically, never guessed.';
  }

  if (q.includes('pneumonia')) {
    return 'Pneumonia is an infection inflaming the lung air sacs, often causing cough with phlegm, fever, chills, and breathing difficulty. Prompt medical evaluation is essential to determine whether bacterial, viral, or supportive therapy is needed.';
  }

  return 'ScanKavach analyzes medical images using an unsupervised memory bank of healthy scans, identifying unusual spatial patterns without requiring disease labels. You can ask about thresholds, borderline flags, image quality tips, prevention, or when to seek clinical care.';
}

/**
 * Dispatches to Gemini if a user has provided a runtime session key in memory
 */
export async function queryAssistant(
  query: string,
  userApiKey: string | null,
  context?: AssistantContext
): Promise<string> {
  if (checkSafetyViolation(query)) {
    return SAFE_REFUSAL;
  }

  // If no runtime key provided, default directly to local mode
  if (!userApiKey || userApiKey.trim() === '') {
    return getLocalAssistantResponse(query, context);
  }

  // Optional Gemini mode
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: userApiKey });

    const contextText = context
      ? `Result context: Verdict=${context.verdict || 'N/A'}, Score=${context.score || 'N/A'}, Percentile=${context.percentile || 'N/A'}%, Borderline=${context.borderline ? 'Yes' : 'No'}, GatePassed=${context.gatePassed ? 'Yes' : 'No'}, SuggestedCondition=${context.suggestion || 'None'}, Reliability=${context.reliability || 'N/A'}.`
      : 'No active scan context.';

    const systemInstruction =
      'You are ScanKavach Assistant. Explain screening results, suggested findings, thresholds, borderline scores, image-quality issues, general prevention and when to see a doctor, in plain language. You are not a doctor. Never diagnose a person, never say a person has a disease, never recommend medicines, doses, home cures or treatment plans. If asked, refuse politely and advise consulting a qualified clinician. Base answers only on the provided result summary, the app documented behaviour and conservative public health guidelines. Keep answers under 120 words.';

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `${contextText}\nUser question: ${query}`,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return getLocalAssistantResponse(query, context);
    }
    return text;
  } catch {
    // Graceful fallback to local engine on error or timeout
    return getLocalAssistantResponse(query, context);
  }
}
