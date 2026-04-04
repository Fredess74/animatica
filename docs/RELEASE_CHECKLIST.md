# Release Checklist

This document tracks the verification steps required before any release of Animatica.

## Pre-Release Verification

- [ ] **Version Synchronization**: Ensure the root `package.json` and all workspace `package.json` files have the same version.
- [ ] **Changelog Updated**: Ensure `CHANGELOG.md` has a new section for the current version with all major changes documented.
- [ ] **Rule #2 Compliance (No Web3)**: Verify that no blockchain, Web3, or cryptocurrency mentions remain in the codebase or documentation.
- [ ] **Standard Architecture**: Ensure all engine renderers are wrapped in `memo(forwardRef(...))` and use `useImperativeHandle`.
- [ ] **Installation Instructions**: Verify that `README.md` has accurate and complete installation and development instructions.
- [ ] **Unit Tests**: All unit tests (`pnpm test`) must pass across the entire monorepo.
- [ ] **Type Checking**: All type checks (`pnpm typecheck`) must pass across the entire monorepo.
- [ ] **Linting**: All lint checks (`pnpm lint`) must pass across the entire monorepo.
- [ ] **Build**: All packages and apps must build successfully (`pnpm build`).

## Final Approval

- [ ] Release Notes reviewed.
- [ ] Tag created in Git.
