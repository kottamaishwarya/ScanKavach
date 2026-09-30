/**
 * @license
 * SPDX-License-Identifier: MIT
 * Conservative public health education content aligned with WHO, MoHFW (India) & ICMR guidelines
 */

export interface MythFact {
  myth: string;
  fact: string;
}

export interface HealthCondition {
  id: string;
  name: string;
  whatItIs: string;
  commonSymptoms: string[];
  whoIsAtHigherRisk: string[];
  prevention: string[];
  whenToSeeDoctor: string[];
  whatDoctorsUsuallyDo: string[];
  mythsVsFacts: MythFact[];
}

export const HEALTH_DISCLAIMER =
  'General health information for education only. It is not a diagnosis or medical advice. Please consult a qualified doctor.' as const;

export const EMERGENCY_NOTICE =
  'In an emergency call 112 (India) or go to the nearest hospital emergency room immediately.' as const;

export const HEALTH_SOURCES_NOTE =
  'Sources: WHO, Ministry of Health and Family Welfare (India), ICMR - please verify all findings with your qualified clinician.' as const;

export const HEALTH_CONDITIONS: HealthCondition[] = [
  {
    id: 'pneumonia',
    name: 'Pneumonia',
    whatItIs:
      'Pneumonia is an infection that inflames the air sacs (alveoli) in one or both lungs. The air sacs may fill with fluid or purulent material.',
    commonSymptoms: [
      'Cough which may produce greenish, yellow or even bloody mucus',
      'Fever, sweating, and shaking chills',
      'Shortness of breath or rapid, shallow breathing',
      'Sharp chest pain that gets worse when you breathe deeply or cough',
      'Loss of appetite, low energy, and fatigue',
    ],
    whoIsAtHigherRisk: [
      'Young children (under 5 years) and older adults (over 65 years)',
      'Individuals who smoke or face high exposure to indoor biomass smoke',
      'People with chronic medical conditions like asthma, COPD, or diabetes',
      'Individuals with weakened immune systems',
    ],
    prevention: [
      'Get recommended immunizations (Pneumococcal conjugate and polysaccharide vaccines, seasonal flu vaccine)',
      'Wash hands regularly with soap and clean water',
      'Avoid tobacco smoke and ensure adequate kitchen ventilation',
      'Maintain balanced nutrition and adequate hydration',
    ],
    whenToSeeDoctor: [
      'Difficulty breathing, shortness of breath at rest, or persistent rapid breathing',
      'Persistent fever of 38.5°C (101.3°F) or higher alongside productive cough',
      'Chest pain with breathing or coughing',
      'Symptoms worsening after initial mild improvement',
    ],
    whatDoctorsUsuallyDo: [
      'Perform a physical chest examination with a stethoscope',
      'Order diagnostic chest X-rays to visualize the location and extent of inflammation',
      'Check blood oxygen saturation using a pulse oximeter',
      'Order sputum tests or complete blood counts if clinically indicated',
      'Prescribe appropriate antimicrobial care and supportive respiratory therapy as needed',
    ],
    mythsVsFacts: [
      {
        myth: 'You only get pneumonia from getting caught in cold rain or winter weather.',
        fact: 'Pneumonia is caused by microorganisms (bacteria, viruses, or fungi) infecting the lungs, not by cold weather alone.',
      },
      {
        myth: 'Once you take one dose of an prescribed antibiotic, you can stop as soon as you feel better.',
        fact: 'Always finish the entire course prescribed by your healthcare provider to prevent antibiotic resistance and recurrence.',
      },
    ],
  },
  {
    id: 'tuberculosis',
    name: 'Tuberculosis (TB)',
    whatItIs:
      'Tuberculosis is a contagious bacterial infection caused by Mycobacterium tuberculosis that primarily affects the lungs. It spreads through microscopic droplets released into the air when an infected person coughs or sneezes.',
    commonSymptoms: [
      'A persistent cough lasting more than 2 to 3 weeks',
      'Coughing up blood or blood-streaked sputum',
      'Low-grade evening fever and recurring night sweats',
      'Unexplained weight loss and loss of appetite',
      'Persistent fatigue, weakness, and chest pain',
    ],
    whoIsAtHigherRisk: [
      'Close household contacts of individuals with untreated active pulmonary TB',
      'Persons living with HIV, diabetes, or severe malnutrition',
      'Tobacco smokers and people with chronic alcohol dependency',
      'Residents of crowded or poorly ventilated living environments',
    ],
    prevention: [
      'BCG vaccination for newborns and infants',
      'Prompt testing and contact tracing for family members of active cases',
      'Ensuring good room ventilation and natural sunlight in living quarters',
      'Practicing cough etiquette (covering mouth/nose with elbow or cloth)',
      'Completing the entire course of medical care without interruption if diagnosed',
    ],
    whenToSeeDoctor: [
      'Any cough persisting beyond two weeks without clear cause',
      'Any episode of coughing up blood or blood-tinged mucus',
      'Drenching night sweats accompanied by noticeable weight loss',
      'Unexplained prolonged low-grade fevers',
    ],
    whatDoctorsUsuallyDo: [
      'Order molecular sputum testing (such as NAAT / CBNAAT / TrueNat available free through India’s National TB Elimination Programme - NTEP)',
      'Examine chest radiographs for characteristic apical or cavitary infiltrates',
      'Provide standardized, directly observed therapy (DOTS) under clinical supervision',
      'Offer nutritional support benefits and household contact screening',
    ],
    mythsVsFacts: [
      {
        myth: 'TB is a hereditary disease passed down through genetics and cannot be cured.',
        fact: 'TB is an airborne bacterial infection and is fully curable with standard, timely antimicrobial therapy provided through government health centres.',
      },
      {
        myth: 'You can contract TB by sharing drinking cups, food plates, or touching clothes.',
        fact: 'TB is spread strictly through inhaling airborne droplets from an active untreated individual; it is not transmitted via shared utensils or handshakes.',
      },
    ],
  },
  {
    id: 'covid-respiratory',
    name: 'COVID-19 & Viral Respiratory Infections',
    whatItIs:
      'Viral infections of the upper and lower respiratory tracts caused by SARS-CoV-2, influenza, or respiratory syncytial virus (RSV).',
    commonSymptoms: [
      'Fever, dry cough, sore throat, and nasal congestion',
      'Loss of taste or smell',
      'Shortness of breath in moderate to severe cases',
      'Headache, generalized body aches, and fatigue',
    ],
    whoIsAtHigherRisk: [
      'Adults aged 60 and older',
      'Individuals with underlying cardiac, pulmonary, kidney, or metabolic conditions',
      'Unvaccinated or immunocompromised individuals',
    ],
    prevention: [
      'Keep up-to-date with approved booster immunizations',
      'Practice frequent hand sanitization and avoid touching the face',
      'Wear a well-fitted mask in poorly ventilated or crowded public places when unwell',
      'Isolate at home during active acute respiratory symptoms',
    ],
    whenToSeeDoctor: [
      'Oxygen saturation dropping below 94% on a calibrated pulse oximeter',
      'Persistent pain or pressure in the chest',
      'Bluish discoloration of lips or nail beds',
      'New onset confusion or inability to wake or stay awake',
    ],
    whatDoctorsUsuallyDo: [
      'Perform rapid antigen or RT-PCR diagnostic swab tests',
      'Monitor vital signs and pulse oximetry trends',
      'Advise symptomatic hydration, rest, and antipyretics under physician guidance',
      'Evaluate chest radiographs for ground-glass opacities in high-risk patients',
    ],
    mythsVsFacts: [
      {
        myth: 'Hot baths or drinking herbal concoctions prevent or cure respiratory viral infections.',
        fact: 'No thermal exposure or beverage cures viral respiratory infections. Vaccination and basic hygiene remain the proven shields.',
      },
      {
        myth: 'Antibiotics kill respiratory viruses and cure the common flu.',
        fact: 'Antibiotics target bacteria only. They have zero efficacy against viruses like SARS-CoV-2 or Influenza.',
      },
    ],
  },
  {
    id: 'asthma-copd',
    name: 'Asthma & Chronic Obstructive Pulmonary Disease (COPD)',
    whatItIs:
      'Chronic inflammatory lung conditions characterized by airflow limitation, bronchospasm, and hyper-reactivity of the bronchial tree.',
    commonSymptoms: [
      'Episodes of wheezing (whistling sound when breathing out)',
      'Chronic shortness of breath, particularly during exertion',
      'Tightness in the chest',
      'Chronic productive morning cough (in COPD)',
    ],
    whoIsAtHigherRisk: [
      'Long-term active or passive tobacco smokers',
      'Occupational exposure to chemical fumes, industrial dust, or biomass fuel smoke',
      'Family history of atopy or allergic asthma',
    ],
    prevention: [
      'Strict cessation of all tobacco products and avoid secondhand smoke',
      'Minimise exposure to domestic dust mites, mould, and pet dander triggers',
      'Use proper protective masks in dusty or industrial workspaces',
      'Adhere to regular maintenance inhaler schedules prescribed by your pulmonologist',
    ],
    whenToSeeDoctor: [
      'Severe breathlessness not relieved by standard rescue inhalers',
      'Inability to speak in full sentences due to air hunger',
      'Cyanosis (bluish tint around lips or fingernails)',
    ],
    whatDoctorsUsuallyDo: [
      'Perform spirometry (pulmonary function testing) with bronchodilator reversibility',
      'Take chest X-rays to rule out pneumonia, pneumothorax, or bullous changes',
      'Prescribe controller and reliever inhalers tailored to disease severity',
      'Devise an individualized written Asthma or COPD Action Plan',
    ],
    mythsVsFacts: [
      {
        myth: 'Inhaled respiratory medications are addictive and should only be used as a last resort.',
        fact: 'Inhalers deliver microgram doses directly to the airway with minimal systemic side effects; they are safe, non-addictive, and disease-stabilizing.',
      },
      {
        myth: 'People with asthma should never participate in exercise or sports.',
        fact: 'With proper medical control, regular physical activity strengthens the respiratory system and is strongly encouraged.',
      },
    ],
  },
  {
    id: 'nodules-cancer',
    name: 'Lung Nodules & Cancer Risk Awareness',
    whatItIs:
      'A lung nodule is a small round or oval growth in the lung, often found incidentally on imaging. The vast majority of small nodules are benign (from past infections), but require clinical evaluation to exclude early neoplastic processes.',
    commonSymptoms: [
      'Most small nodules cause no symptoms whatsoever',
      'New or changing persistent cough that does not resolve',
      'Coughing up small amounts of blood',
      'Unexplained weight loss and persistent localized chest or shoulder pain',
    ],
    whoIsAtHigherRisk: [
      'People with a significant history of cigarette smoking',
      'Individuals aged 50 and above',
      'Long-term occupational exposure to asbestos, silica, radon, or heavy industrial particulate matter',
      'Family history of lung malignancy',
    ],
    prevention: [
      'Complete tobacco avoidance is the single most effective preventive measure',
      'Test home environments for radon where geographically applicable',
      'Follow workplace safety protocols for respiratory PPE around airborne mineral dusts',
      'Follow up on incidental radiological findings strictly as recommended by your physician',
    ],
    whenToSeeDoctor: [
      'Any unexplained pulmonary nodule reported on an imaging study',
      'Coughing up blood or dark phlegm',
      'Unintended weight loss exceeding 5% of body weight over a few months',
      'Persistent hoarseness or difficulty swallowing',
    ],
    whatDoctorsUsuallyDo: [
      'Review previous imaging to assess whether the nodule has changed over time',
      'Recommend low-dose computed tomography (LDCT) for detailed nodule characterization',
      'Calculate clinical risk scores based on size, border spiculation, and smoking history',
      'Refer to a thoracic multidisciplinary team if surveillance or tissue sampling is indicated',
    ],
    mythsVsFacts: [
      {
        myth: 'Finding a nodule on a chest X-ray means a person definitely has cancer.',
        fact: 'Over 90% of small pulmonary nodules are benign granulomas or scars from previous resolved infections.',
      },
      {
        myth: 'Only active heavy smokers can ever develop lung issues or nodules.',
        fact: 'Environmental secondhand smoke, air pollution, and genetic factors also contribute; anyone with persistent symptoms should be evaluated.',
      },
    ],
  },
];
