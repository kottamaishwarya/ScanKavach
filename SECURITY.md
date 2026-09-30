# Security & Threat Model

ScanKavach is designed around a zero-trust, client-authoritative security model specifically tailored for healthcare screening.

## Threat Model & Security Posture

### 1. Zero Cloud Data Transmission
- **Protected**: Medical images, DICOM pixel data, patient identity, and hospital metadata never leave the client's local browser memory.
- **Implementation**: The TensorFlow.js pipeline executes completely client-side in WebGL/CPU execution contexts. No `/upload` endpoints or remote backend proxies exist.

### 2. Secret Hygiene Policy
- **Protected**: Zero API keys, database credentials, or private access tokens exist in the repository or compiled Vite bundles.
- **Gemini Runtime Key**: The optional Gemini API key is entered manually by the user at runtime. It is held **only in volatile JavaScript memory for the active tab** and is never persisted to `localStorage`, `sessionStorage`, IndexedDB, audit logs, or export files. It is immediately purged on logout or page refresh.

### 3. CSV Formula Injection Defense
- **Protected**: Batch triage and history CSV exports cannot execute arbitrary shell or spreadsheet macros.
- **Implementation**: All cells prefixed with dangerous characters (`=`, `+`, `-`, `@`, `\t`, `\r`) are sanitized by prepending a single quote (`'`), preventing formula injection attacks in Microsoft Excel or Google Sheets.

### 4. Client-Side Authentication Architecture
- **Implementation**: Passwords are salted with 16 random cryptographically secure bytes (`crypto.getRandomValues`) and hashed using Web Crypto PBKDF2 (SHA-256 with 100,000 iterations).
- **Brute-Force Defense**: An automatic 30-second lockout is triggered after 5 consecutive failed login attempts.
- **Constant-Time Comparison**: Hashes are compared in constant time (`timingSafeEqualHex`) to eliminate side-channel timing attacks.

### 5. Content Security Policy (CSP) & HTTP Headers
Configured via `index.html` and `vercel.json`:
- `Content-Security-Policy`: Restricts scripts to `'self'`, prevents object embedding (`object-src 'none'`), and allows network connections only to authorized model storage.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
- `X-Frame-Options: DENY`: Prevents clickjacking and framing attacks.
- `Referrer-Policy: no-referrer`: Omits referrer headers from outgoing links.
- `Permissions-Policy: camera=(self)`: Restricts hardware camera access strictly to the app origin.
