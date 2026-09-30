# ScanKavach Architecture & Data Flow

ScanKavach is an entirely client-side, privacy-preserving medical imaging anomaly screening and decision-support web application.

```mermaid
flowchart TD
    A[User Radiograph Upload] --> B[Strip Metadata via Canvas]
    B --> C{4-Point Input Safety Gate}
    C -- Failed --> D[GateRejectCard: Specific Rejection Reason & Tips]
    C -- Passed --> E[MobileNet v1 0.25 Feature Extractor]
    E --> F[Patch Feature Map 14x14x128]
    E --> G[Global Average Embedding 128-d]
    
    F --> H[Nearest-Neighbour Search vs Healthy Memory Bank]
    H --> I[Patch Anomaly Scores & Spatial Heatmap]
    I --> J[Empirical Percentile Calibration]
    J --> K[Normal / Review / Refer Verdict & Borderline Band]
    
    G --> L[Scanner & Protocol Shift Detector]
    G --> M[Optional Supervised Softmax Head]
    
    K --> N[Signal Fusion Engine]
    M --> N
    L --> O[Reliability Evaluator & Abstain Rule]
    N --> O
    
    O --> P[Comprehensive Decision Support Result]
    P --> Q[Side-by-Side Nearest Healthy Exemplar]
    P --> R[PDF Clinical Report Download]
```

## Module Responsibilities

1. **`src/lib/gate.ts`**: Verifies that input images meet clinical screening validity before executing neural inference. Checks color variance, contrast standard deviation, Laplacian sharpness, and embedding distance.
2. **`src/lib/extractor.ts`**: Lazy-loads MobileNet v1 0.25 (layer `conv_pw_11_relu`) using TensorFlow.js with WebGL acceleration and CPU fallback.
3. **`src/lib/memoryBank.ts`**: Stores sub-sampled patch vectors from healthy reference scans. Performs chunked Euclidean matrix multiplication (`tf.matMul`).
4. **`src/lib/verdict.ts`**: Computes Normal / Review / Refer triage classifications based on empirical 95th and 99th percentiles of a held-out healthy validation set, with a 5% borderline margin.
5. **`src/lib/fusion.ts`**: Reconciles unsupervised anomaly scores with supervised classifier suggestions to output `Consistent-normal`, `Suggested-condition`, `Conflict`, or `Inconclusive`.
6. **`src/lib/reliability.ts`**: Assesses operational confidence and invokes the Abstain rule whenever conflicting signals or scanner protocol shifts are detected.
