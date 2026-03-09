# Animatica — Release Checklist

This document defines the mandatory verification procedure for all releases. Every item must be checked before a version is tagged and released.

## 1. Version Consistency
- [x] Workspace root `package.json` version matches the release target.
- [x] All package `package.json` files (`packages/*`, `apps/*`) have the same version.
- [x] `CHANGELOG.md` has an entry for the new version with the correct date.
- [x] Lockfile (`pnpm-lock.yaml`) is up to date (`pnpm install`).

## 2. Quality Assurance (Tests)
- [x] Unit tests pass for all packages (`pnpm run test`).
- [ ] Type checking passes for all packages (`pnpm run typecheck`).
- [ ] Linting passes without errors (`pnpm run lint`).
- [ ] Build succeeds for all packages and apps (`pnpm run build`).
- [ ] (Optional) End-to-end tests pass (if applicable).

## 3. Documentation Audit
- [x] `README.md` has accurate installation and usage instructions.
- [ ] `docs/ARCHITECTURE.md` is updated with any architectural changes.
- [ ] `docs/DATA_MODELS.md` reflects the current TypeScript interfaces.
- [ ] `docs/API_REFERENCE.md` (if exists) is accurate.
- [x] `docs/JULES_GUIDE.md` instructions are still relevant.

## 4. Legal & Compliance
- [x] License audit performed (`pnpm run audit:licenses`).
- [x] All dependencies are MIT/MIT-0 or explicitly approved.
- [x] No blockchain/Web3 content present in code or docs (as per `docs/WEB3_READINESS.md`).

## 5. Deployment Readiness
- [x] Environment variable templates (`.env.example`) are up to date.
- [x] Supabase migrations are tested and ready for production.
- [x] Bundle size is within acceptable limits (see `docs/BUNDLE_REPORT.md`).

---

**Last Verified Version:** 0.1.0
**Date:** 2026-03-08
**Result:** PASSED
