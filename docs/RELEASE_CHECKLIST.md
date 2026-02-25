# Release Checklist

This document outlines the mandatory steps to be completed before any production release of Animatica.

## 1. Versioning
- [x] All `package.json` files have consistent versions (root, packages/*, apps/*).
- [x] Version follows Semantic Versioning (SemVer) principles.
- [ ] (Optional) Version has been bumped if new features or fixes are included (as requested by Conductor).

## 2. Documentation
- [x] `README.md` is accurate and includes updated install/run instructions.
- [x] `CHANGELOG.md` has been updated with all changes since the last release.
- [ ] `CHANGELOG.md` moved `[Unreleased]` entries to a new version header if applicable.
- [ ] `docs/ARCHITECTURE.md` and other relevant docs reflect current codebase state.
- [x] `claude.md` (Context Document) is up to date.

## 3. Code Quality & Validation
- [x] `pnpm typecheck` passes with zero errors across all packages.
- [ ] `pnpm lint` passes with zero errors.
- [x] `pnpm test` passes all unit and integration tests.
- [x] No `TODO` or `FIXME` comments remain in the code that are critical for the release.

## 4. Security & Compliance
- [ ] `pnpm audit` shows no high or critical vulnerabilities.
- [ ] `pnpm run audit-licenses` (if available) passes.
- [ ] No secrets or API keys are hardcoded in the codebase.

## 5. Performance
- [ ] `pnpm test` (benchmarks) shows no significant performance regressions.
- [ ] Bundle sizes are within acceptable limits (see `docs/BUNDLE_REPORT.md`).

## 6. Verification
- [ ] Build artifacts (`dist/`, `.next/`) are successfully generated.
- [ ] Basic "Smoke Test" of the built application/package is successful.
