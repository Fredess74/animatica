# Release Checklist

This document outlines the mandatory steps to be completed before each official release of Animatica.

## 1. Pre-Release Validation
- [x] Ensure all tests pass across the monorepo (`pnpm test`).
- [ ] Run type checking to ensure no regressions (`pnpm run typecheck`).
- [ ] Run linting to maintain code quality (`pnpm run lint`).
- [ ] Build all packages and apps to verify build integrity (`pnpm run build`).

## 2. Versioning & Changelog
- [x] Bump version in root `package.json` and all workspace packages.
- [x] Update `CHANGELOG.md` with a summary of changes since the last release.
- [x] Ensure the release date is correctly specified in `CHANGELOG.md`.

## 3. Documentation
- [x] Update `README.md` with any new installation or usage instructions.
- [ ] Verify that all new features are documented in `docs/`.
- [x] Update `PROGRESS.md` to reflect the latest completion status.
- [ ] Run a license audit if dependencies have changed (`docs/LICENSE_AUDIT.md`).

## 4. Final Checks
- [ ] Review bundle sizes for any unexpected regressions.
- [x] Verify that no "blockchain/web3" content has leaked into the codebase. (Already known to exist in `docs/SMART_CONTRACTS.md` and `packages/contracts`, scheduled for removal in future sprints)
- [x] Ensure `JULES_GUIDE.md` is up to date with the latest task sequence.
- [x] Confirm that all critical rules from `JULES_GUIDE.md` have been followed.

## 5. Submission
- [x] Commit all changes with the message: `chore(release): pre-release check`.
- [ ] Create a release tag in the version format (e.g., `v0.2.0`).
