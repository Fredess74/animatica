# Release Checklist

## Versioning
- [x] Root `package.json` version matches release version (0.2.0).
- [ ] Workspace package versions updated (engine, editor, platform, web).
- [x] `CHANGELOG.md` updated with new version and date.

## Documentation
- [x] `README.md` install instructions verified.
- [x] No references to forbidden topics (blockchain/Web3) in core docs.
- [x] `JULES_GUIDE.md` up to date with latest project structure.

## Testing
- [ ] All unit tests pass (`pnpm test`).
- [x] Benchmarks within acceptable ranges (`reports/baseline_metrics.json`).
- [x] No regression in core renderers (Character, Primitive, Light, Camera).

## Quality & Compliance
- [ ] License audit completed (`pnpm licenses`).
- [x] Bundle size within targets (`docs/BUNDLE_REPORT.md`).
- [ ] No unresolved merge conflict markers in `docs/`.

## Pre-Release Status (2026-05-01)
- **Version:** 0.2.0
- **Test Status:** [STABILIZING]
- **Fixed Issues:**
  - `CharacterRenderer.test.tsx` TypeError fixed via memo/forwardRef.
  - `Viewport.test.tsx` missing mocks added.
- **Pending Issues:**
  - Workspace package version syncing.
  - Full test pass verification.
