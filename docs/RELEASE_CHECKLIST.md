# Release Checklist

This document outlines the mandatory steps to ensure a high-quality, stable release of the Animatica platform.

## Pre-Release Checks

- [ ] **Version Verification**
    - [ ] Root `package.json` version is updated.
    - [ ] All package `package.json` versions are consistent (engine, editor, platform, web).
    - [ ] All internal package names and imports use the correct case-sensitive `@Animatica/` scope.
    - [ ] `pnpm-lock.yaml` is up-to-date (`pnpm install`).
- [ ] **Changelog Update**
    - [ ] `CHANGELOG.md` has an `[Unreleased]` section with all significant changes.
    - [ ] Previous version entries are properly dated and linked.
- [ ] **Documentation Audit**
    - [ ] `README.md` reflects current features and install instructions.
    - [ ] `docs/PROGRESS.md` is updated to current completion status.
    - [ ] `docs/ARCHITECTURE.md` reflects any major architectural changes.
- [ ] **Code Quality**
    - [ ] `pnpm typecheck` passes with zero errors across all packages.
    - [ ] `pnpm lint` passes with zero errors (or acceptable warnings).
    - [ ] No `TODO` or `FIXME` comments remain in the code slated for release.
- [ ] **Testing**
    - [ ] `pnpm test` passes all unit and integration tests.
    - [ ] E2E tests (if applicable) pass on the `apps/web` package.
- [ ] **Legal & Security**
    - [ ] `pnpm run audit` (or equivalent) shows no high/critical vulnerabilities.
    - [ ] `docs/LICENSE_AUDIT.md` is updated and all dependencies are MIT-compatible.
    - [ ] No secrets or API keys are committed to the repository.

## Release Process

1. Create a release branch: `release/vX.Y.Z`.
2. Perform all pre-release checks above.
3. Bump versions using `pnpm version` in each package or via root script.
4. Merge release branch into `main`.
5. Tag the commit: `git tag vX.Y.Z`.
6. Push tags to origin: `git push origin --tags`.
7. (Optional) Publish packages to registry.
