# Release Checklist

This document outlines the mandatory steps to be completed before any release.

## Pre-Release Steps

### 1. Versioning & Consistency
- [ ] Ensure version is consistent across all `package.json` files in the monorepo.
- [ ] Verify `CHANGELOG.md` is updated with all changes since the last release.
- [ ] Ensure `[Unreleased]` section is ready for the next iteration.

### 2. Code Quality & Testing
- [ ] Run `pnpm install` to ensure lockfile is up to date.
- [ ] Run `pnpm run typecheck` across all packages.
- [ ] Run `pnpm run lint` across all packages.
- [ ] Run `pnpm run test` and ensure 100% pass rate.
- [ ] Verify that new features have accompanying unit or integration tests.

### 3. Documentation
- [ ] Verify `README.md` has accurate installation and usage instructions.
- [ ] Ensure `docs/` are up to date with the latest architectural changes.
- [ ] Verify that no forbidden topics (Blockchain, Web3, etc.) are mentioned.

### 4. Build & Artifacts
- [ ] Run `pnpm run build` to ensure the project builds correctly.
- [ ] Verify bundle sizes are within acceptable limits (see `docs/BUNDLE_REPORT.md`).

### 5. Final Verification
- [ ] Check `git log` to ensure no unauthorized changes were committed.
- [ ] Ensure all PR comments have been addressed.

## Release Process
1. Create a release branch `release/vX.Y.Z`.
2. Complete all items in this checklist.
3. Merge release branch into `main`.
4. Tag the commit with `vX.Y.Z`.
5. Push tags to origin.
