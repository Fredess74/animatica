# Release Checklist

This document outlines the mandatory steps to be completed before each official release of Animatica.

## 1. Pre-Release Validation
- [ ] Ensure all tests pass across the monorepo (`pnpm test`).
- [ ] Run type checking to ensure no regressions (`pnpm run typecheck`).
- [ ] Run linting to maintain code quality (`pnpm run lint`).
- [ ] Build all packages and apps to verify build integrity (`pnpm run build`).

## 2. Versioning & Changelog
- [ ] Bump version in root `package.json` and all workspace packages.
- [ ] Update `CHANGELOG.md` with a summary of changes since the last release.
- [ ] Ensure the release date is correctly specified in `CHANGELOG.md`.

## 3. Documentation
- [ ] Update `README.md` with any new installation or usage instructions.
- [ ] Verify that all new features are documented in `docs/`.
- [ ] Update `PROGRESS.md` to reflect the latest completion status.
- [ ] Run a license audit if dependencies have changed (`docs/LICENSE_AUDIT.md`).

## 4. Final Checks
- [ ] Review bundle sizes for any unexpected regressions.
- [ ] Verify that no "blockchain/web3" content has leaked into the codebase.
- [ ] Ensure `JULES_GUIDE.md` is up to date with the latest task sequence.
- [ ] Confirm that all critical rules from `JULES_GUIDE.md` have been followed.

## 5. Submission
- [ ] Commit all changes with the message: `chore(release): pre-release check`.
- [ ] Create a release tag in the version format (e.g., `v0.2.0`).
