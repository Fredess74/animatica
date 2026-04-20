# Release Readiness Checklist

This document outlines the mandatory checks required before any release of Animatica.

## 1. Versioning & Package Integrity
- [ ] All `package.json` files have consistent versions (e.g., `0.1.0`).
- [ ] `pnpm-lock.yaml` is up-to-date and reflects the current dependency tree.
- [ ] `pnpm install` runs without errors or warnings.
- [ ] No `any` types are used in core engine or editor packages.

## 2. Documentation
- [ ] `README.md` has accurate installation and quickstart instructions.
- [ ] `CHANGELOG.md` is updated with all notable changes since the last release.
- [ ] `JULES_GUIDE.md` is updated with any new coding standards or rules.
- [ ] All public APIs in `engine` and `editor` have JSDoc comments.

## 3. Testing & Quality
- [ ] `pnpm run test` passes across all workspace packages.
- [ ] `pnpm run typecheck` passes without errors.
- [ ] Unit test coverage for `engine` is above 90%.
- [ ] Performance benchmarks are within acceptable thresholds (see `reports/baseline_metrics.json`).

## 4. Bundle & Assets
- [ ] `engine` and `editor` bundle sizes are audited (see `docs/BUNDLE_REPORT.md`).
- [ ] Large 3D dependencies (`three`, `r3f`) are correctly externalized in `vite.config.ts`.
- [ ] Placeholder assets are provided for any missing GLB models.

## 5. Security & Legal
- [ ] License audit completed (`docs/LICENSE_AUDIT.md`).
- [ ] No blockchain/Web3 residues remain in the codebase (Rule 2 of `JULES_GUIDE.md`).
- [ ] Supabase migrations are verified and match the current schema.
