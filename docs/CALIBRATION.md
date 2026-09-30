# ScanKavach Calibration Methodology

## Mathematical Foundations

Traditional anomaly detectors rely on arbitrary heuristic distance cut-offs. ScanKavach enforces empirical validation calibration:

1. **Non-Overlapping Split**:
   - Healthy scans are partitioned into a **Bank Set** (70%) and a **Validation Set** (30%).
   - Thresholds are never calculated on bank images (which would artificially yield near-zero self-distances).

2. **Percentile-Based Operating Thresholds**:
   - **Review Threshold**: 95th percentile of validation anomaly scores ($P_{95}$). By design, ~5% of healthy scans naturally fall into Review to ensure high screening sensitivity.
   - **Refer Threshold**: 99th percentile of validation anomaly scores ($P_{99}$). Designates the top 1% most marked deviations from healthy baseline tissue.

3. **Relative Borderline Window**:
   $$\text{Borderline Range} = [T \times (1 - \delta), T \times (1 + \delta)]$$
   where $\delta = 0.05$ (5% relative margin). Any score falling within this band is labeled `Borderline: needs human review`.

4. **Safety Gate Blur & Out-of-Distribution Bounds**:
   - Blur limit: $\max(1.0, \frac{1}{2} \times P_{5}(\text{Laplacian Variance}))$.
   - OOD distance limit: $\max(\text{Validation Embedding Distances}) \times 1.5$.
