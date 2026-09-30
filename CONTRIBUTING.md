# Contributing to ScanKavach

We welcome contributions to improve the accessibility, calibration robustness, and security of ScanKavach.

## Development Workflow

1. **Clone & Install**:
   ```bash
   git clone https://github.com/scankavach/scankavach.git
   cd scankavach
   npm install
   ```

2. **Run Local Dev Server**:
   ```bash
   npm run dev
   ```

3. **Verify Standards Before Submitting**:
   ```bash
   npm run typecheck
   npm test
   npm run test:coverage
   npm run build
   ```

## Code Guidelines

- **TypeScript**: Strict mode with explicit types (`noUncheckedIndexedAccess`, zero `any` usage).
- **Functions**: Single-purpose, max ~40 lines, cyclomatic complexity &le; 10.
- **Safety Terminology**: Never commit code containing diagnostic phrasing like "you have", "diagnosed with", or pharmaceutical drug prescriptions.
- **Privacy Guarantee**: Never commit any remote endpoint that transmits raw image pixels or patient identifiers.
