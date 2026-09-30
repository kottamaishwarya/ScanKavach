# Changelog

All notable changes to ScanKavach are documented in this file.

## [1.0.0] - 2026-09-30

### Initial Release (OptiForge 2026 Innovation Milestone)
- **4-Point Input Safety Gate**: Pre-screening validation blocking color photos, blurry inputs, low contrast images, and out-of-distribution body parts.
- **Explainable Side-by-Side Visualizer**: Automated retrieval of nearest healthy memory bank exemplar with 3x3 region localization and plain-language explanation sentences.
- **Empirically Calibrated Triage Verdicts**: Normal / Review / Refer thresholds derived from the 95th and 99th percentiles of held-out validation data with a 5% borderline margin.
- **Dual-Engine Fusion**: Fusion logic bridging unsupervised patch memory banks with supervised condition classifiers, featuring explicit `Conflict` and `Inconclusive` state detection.
- **Scanner Shift Detection**: Statistical metric separating global hardware protocol shifts from focal lesions.
- **The Abstain Rule**: Automatic halting to human review when operational signals exhibit high uncertainty.
- **Multilingual Support**: Complete localization in English, Telugu (తెలుగు), and Hindi (हिन्दी).
- **Interactive Evaluation Lab**: Live ROC curves, AUROC calculation via Mann-Whitney U, and operating point threshold slider.
- **Zero-Secret Client Architecture**: 100% in-browser TensorFlow.js execution, PBKDF2 authentication, and formula-injection-safe CSV exports.
