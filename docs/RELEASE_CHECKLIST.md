# 🚀 Animatica Release Checklist

This document outlines the mandatory checks and steps required before every release.

## 1. Versioning & Manifests
- [ ] Version is consistent across:
    - [ ] Root `package.json`
    - [ ] `packages/engine/package.json`
    - [ ] `packages/editor/package.json`
    - [ ] `packages/platform/package.json`
    - [ ] `apps/web/package.json`
- [ ] `CHANGELOG.md` is updated with all changes under the new version header.
- [ ] `CHANGELOG.md` contains an `[Unreleased]` section for future tracking.

## 2. Documentation
- [ ] `README.md` contains accurate project description and quick start instructions.
- [ ] `JULES_GUIDE.md` is updated with any new coding standards or task sequences.
- [ ] Forbidden terms (blockchain, crypto, NFTs, etc.) are NOT present in any documentation.
- [ ] `PROGRESS.md` accurately reflects the completion status of all phases.
- [ ] License audit (`docs/LICENSE_AUDIT.md`) is up to date and all licenses are compatible.

## 3. Quality & Testing
- [ ] `pnpm install` completes without errors (verify `pnpm-lock.yaml` is healthy).
- [ ] `pnpm run build` completes successfully for all packages.
- [ ] `pnpm run typecheck` passes with zero errors across the monorepo.
- [ ] `pnpm run test` passes for all unit and integration tests.
- [ ] Performance benchmarks (`reports/baseline_metrics.json`) are updated and meet requirements.
- [ ] Bundle sizes (`docs/BUNDLE_REPORT.md`) are within acceptable limits.

## 4. Legal & Compliance
- [ ] `LICENSE` file is present and contains correct copyright information.
- [ ] No proprietary or sensitive information (API keys, secrets) is committed to the repository.

## 5. Final Verification
- [ ] `git pull origin main --rebase` was performed before final check.
- [ ] Branch naming follows conventions (e.g., `chore(release): pre-release-check`).
- [ ] No merge conflict markers remain in any file.
