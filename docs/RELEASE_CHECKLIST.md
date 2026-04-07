# Release Checklist

This document tracks the steps required for a successful release of the Animatica platform.

## Pre-Release Checks

- [x] Synchronize version numbers across the monorepo (`package.json` in root and all packages).
- [x] Update `CHANGELOG.md` with the new version and its changes.
- [x] Verify `README.md` contains up-to-date installation and usage instructions.
- [x] Run `pnpm install` to ensure lockfile is up-to-date.
- [ ] Run all unit tests (`pnpm run test`) and ensure 100% pass rate.
- [ ] Run type checking (`pnpm run typecheck`) and ensure no errors.
- [ ] Run linting (`pnpm run lint`) and resolve any issues.
- [ ] Verify build process (`pnpm run build`) completes successfully for all packages.

## Release Process

1. [ ] Create a new release branch (e.g., `release/v0.2.0`).
2. [ ] Tag the release in Git (e.g., `git tag v0.2.0`).
3. [ ] Push tags to the remote repository.
4. [ ] Draft and publish the release on GitHub with the changelog.

## Post-Release

1. [ ] Verify the release in the production/staging environment.
2. [ ] Update the `PROGRESS.md` document if necessary.
