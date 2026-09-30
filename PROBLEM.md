# The Healthcare Problem & Clinical Need

## Global & Regional Context

Chest radiography (X-ray) is the most ubiquitous and cost-effective diagnostic imaging modality worldwide. However, healthcare systems in developing nations and rural communities face severe structural bottlenecks:

1. **Severe Radiologist Shortages & Delayed Triage**:
   - Rural clinics, community health centres (CHCs), and primary care dispensaries frequently operate without dedicated on-site radiologists.
   - Patients wait days or weeks for remote teleradiology interpretation, allowing treatable respiratory conditions (such as bacterial pneumonia or active tuberculosis) to progress to severe, irreversible stages.

2. **The Disease-Label Bottleneck in Traditional Medical AI**:
   - Supervised deep learning models require tens of thousands of human-annotated, expert-verified disease labels.
   - Rare pathologies, atypical presentations, and emerging pathogens lack sufficient annotated training samples.

3. **High False Alarm Rates on Sub-Optimal Real-World Inputs**:
   - Deployed neural networks regularly misclassify non-radiographic images (e.g., color photos of computer screens, patient selfies, blurred scans) as severe pathology.

4. **Hardware & Scanner Protocol Confounders**:
   - When models are trained across different hospitals, they frequently learn the distinct radiological artifacts of specific scanner manufacturers rather than genuine anatomical pathology.

## Target User Personas

- **Primary-Care Clinicians (CHCs & PHCs)**: Needing immediate triage confidence to decide whether a patient requires emergency referral or standard symptomatic observation.
- **Radiology Technicians**: Needing instant, on-device quality verification before discharging the patient from the imaging room.
- **Medical Students & Pulmonology Residents**: Seeking visual explainability that pairs anomalous tissue patterns with verified healthy exemplars.

## ScanKavach Feature Mapping

| Clinical Challenge | ScanKavach Technical Solution | Source File |
| :--- | :--- | :--- |
| False alarms on bad images | 4-point Input Safety Gate (color, contrast, blur, OOD) | `src/lib/gate.ts` |
| Lack of disease annotations | Unsupervised PatchCore-style Memory Bank from healthy scans | `src/lib/memoryBank.ts` |
| Arbitrary threshold guessing | Empirical 95th & 99th percentile calibration with 5% borderline margin | `src/lib/verdict.ts` |
| Black-box clinician mistrust | Side-by-side nearest healthy exemplar + 3x3 region localization | `src/lib/explain.ts` |
| Hardware variation confusion | Scanner-shift detector separating global shifts from focal lesions | `src/lib/shift.ts` |
| Patient data breach risk | 100% on-device client-side execution (zero cloud upload) | `src/lib/extractor.ts` |

## Alignment with OptiForge Theme & UN SDGs

### OptiForge 2026 Theme Alignment
*“Label-Free Anomaly Screening and Decision Support for Medical Images”*
- **Label-Free**: Requires only unannotated healthy baseline chest radiographs (`src/lib/memoryBank.ts`).
- **Anomaly Screening**: Quantifies patch-level feature divergence using chunked Euclidean distance (`src/lib/scorer.ts`).
- **Decision Support**: Provides calibrated triage verdicts, confidence ratings, and public health next steps rather than autonomous diagnostic claims (`src/lib/nextSteps.ts`).

### United Nations Sustainable Development Goals
- **SDG 3: Good Health & Well-Being**
  - **Target 3.4**: Reduces premature mortality from non-communicable and infectious respiratory diseases through rapid triage.
  - **Target 3.8**: Fosters universal digital health coverage by providing zero-cost clinical decision support.
- **SDG 9: Industry, Innovation & Infrastructure (Target 9.5)**: Delivers client-side WebGL acceleration on commodity hardware without requiring expensive cloud GPU infrastructure.
- **SDG 10: Reduced Inequalities (Target 10.2)**: Multilingual accessibility (English, Telugu, Hindi) ensuring equitable access for regional healthcare workers.

## Limitations & Responsible Use

ScanKavach is an assistive research prototype and decision support system. It is **NOT** a certified medical device and does **NOT** provide autonomous medical diagnoses. All outputs must be reviewed and correlated clinically by a licensed medical practitioner.
