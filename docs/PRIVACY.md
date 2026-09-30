# ScanKavach Privacy & Data Governance Architecture

## Core Architectural Guarantees

1. **Strictly On-Device Execution**:
   - Medical scans, DICOM pixels, and images are processed exclusively in client browser RAM using WebGL/CPU shaders.
   - Images never travel across the internet.

2. **Metadata Sanitization**:
   - EXIF, patient identifiers, institution metadata, and scanner tags are stripped by rendering to an unlinked HTML5 canvas before feature extraction.

3. **Zero Image Storage in History**:
   - The local history store (`scankavach_history`) saves only scalar quantitative statistics (score, percentile, verdict, region string, latency). No image data or base64 strings are persisted to disk.

4. **Ephemeral Secret Hygiene**:
   - The optional Gemini API key is never written to disk, `localStorage`, `sessionStorage`, or IndexedDB. It is held only in volatile JavaScript execution scope and discarded on sign out or page reload.
