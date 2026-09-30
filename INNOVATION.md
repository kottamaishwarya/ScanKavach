# Technical Novelty & Track Innovation

ScanKavach extends foundational unsupervised representation learning (PatchCore methodology) into an end-to-end, clinically safe screening and decision-support system.

## Comparison: Plain PatchCore vs. ScanKavach

| Capability Dimension | Conventional Plain PatchCore | ScanKavach Decision Shield |
| :--- | :--- | :--- |
| **Input Safety Defense** | None. Scores color selfies, blank images, or broken files with misleading high anomaly values. | **4-Point Input Safety Gate**: Verifies color difference, contrast standard deviation, discrete Laplacian sharpness, and embedding OOD distance before neural scoring (`src/lib/gate.ts`). |
| **Interpretability** | Single scalar distance metric and uncalibrated 2D heatmaps. | **Nearest Healthy Exemplar & 3x3 Region Localization**: Pairs query scan with closest healthy bank exemplar, computes affected area percentage, and generates plain-language location sentences (`src/lib/explain.ts`). |
| **Decision Thresholds** | Arbitrary manual cutoff or heuristic guessing. | **Empirical Percentile Calibration**: 95th (Review) and 99th (Refer) percentiles derived mathematically from held-out healthy validation sets (`src/lib/verdict.ts`). |
| **Ambiguity Handling** | Binary threshold forces high-risk false certainties. | **5% Relative Borderline Band**: Automatically flags scores near triage boundaries as `Borderline: needs human review` (`src/lib/verdict.ts`). |
| **Acquisition Variation** | Conflates hardware differences with disease pathology. | **Scanner-Shift Detector**: Analyzes uniform patch elevation to distinguish global hardware protocol shifts from focal lesions (`src/lib/shift.ts`). |
| **Multi-Signal Fusion** | Unsupervised only; no mechanism to incorporate supervised classes. | **Dual-Engine Fusion**: Reconciles unsupervised anomaly detection with supervised condition classifiers, explicitly generating `Conflict` or `Inconclusive` flags (`src/lib/fusion.ts`). |
| **Operational Safety** | Blindly forces a score regardless of uncertainty. | **The Abstain Rule**: When conflicting signals or shift + borderline arise, primary state halts to `Not reliable enough to score: human review needed` (`src/lib/reliability.ts`). |
| **Threshold Interactivity** | Static, non-configurable settings. | **Interactive Sensitivity Slider**: Real-time AUROC and ROC curve adjustment with instant sensitivity/specificity feedback (`src/pages/EvaluationPage.tsx`). |
| **Regional Inclusivity** | English-only cloud-dependent dashboards. | **100% On-Device & Multilingual**: Executes locally in browser RAM with full English, Telugu, and Hindi translations (`src/lib/i18n.ts`). |
| **Evaluator Accessibility** | Requires custom local X-ray files to test. | **60-Second Guided Tour**: Instant visual walkthrough demonstrating every innovation component with synthetic clinical scenarios (`src/components/TourModal.tsx`). |
