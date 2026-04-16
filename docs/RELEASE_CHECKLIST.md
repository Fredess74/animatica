# Release Checklist

This document tracks the steps required for a successful release of Animatica.

## Pre-Release Tasks

- [x] **Check JULES_GUIDE.md**: Ensure all coding standards and rules are met.
- [x] **Verify Version**: Update version in `package.json` (root and all packages/apps) to `0.2.0`.
- [x] **Update CHANGELOG.md**: Add new version section with a summary of changes and current date.
- [x] **Run Unit Tests**: All tests in the monorepo must pass (`pnpm test`).
- [ ] **Typecheck**: Ensure no TypeScript errors across all packages (`pnpm typecheck`).
- [ ] **Build Artifacts**: Verify that the project builds successfully (`pnpm build`).
- [x] **Review Documentation**: Ensure README.md and other docs are up to date and accurate.
- [x] **Sanitize Scope**: Ensure no forbidden topics (blockchain/Web3/etc.) are present in the release.

## Release Execution

- [ ] **Final Version Bump**: Ensure version is final (no -beta, -rc unless intended).
- [ ] **Create Tag**: Tag the release in git (e.g., `v0.2.0`).
- [ ] **Push Changes**: Push the final commit and tags to the main branch.

## Post-Release Tasks

- [ ] **Announce Release**: Notify the team or community.
- [ ] **Update Progress**: Reflect completion of relevant phases in `docs/PROGRESS.md`.
