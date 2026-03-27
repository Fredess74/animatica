# Release Checklist

This document outlines the standard procedure for preparing and verifying a new release of Animatica.

## 1. Pre-Release Preparation

- [x] **Rebase**: Pull latest `main` and rebase your branch (`git pull origin main --rebase`).
- [x] **Version Bump**: Increment the version in the root `package.json` and all internal package `package.json` files.
- [x] **Changelog**: Update `CHANGELOG.md` with a new entry for the target version, summarizing all major changes, additions, and fixes.
- [x] **Install Dependencies**: Run `pnpm install` to ensure the lockfile is up to date.

## 2. Verification

- [x] **Unit Tests**: Run `pnpm test` from the root. All tests must pass across all packages.
- [x] **Type Checking**: Run `pnpm typecheck` from the root. Ensure there are no TypeScript errors.
- [x] **Linting**: Run `pnpm lint` from the root to ensure code style compliance.
- [x] **Build Check**: Run `pnpm build` to ensure all packages and apps compile successfully.
- [ ] **E2E Tests**: (If applicable) Run Playwright tests in `apps/web`.

## 3. Documentation

- [x] **README**: Ensure `README.md` has up-to-date installation and setup instructions.
- [x] **Progress**: Update `docs/PROGRESS.md` to reflect current phase completion.
- [ ] **Architecture**: Update `docs/ARCHITECTURE.md` if any core interfaces or module structures changed.

## 4. Final Steps

- [x] **Final Review**: Perform a final self-review of all code changes.
- [ ] **Submit**: Create a PR with the title `chore(release): version X.Y.Z`.
