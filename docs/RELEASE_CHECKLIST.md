# Release Checklist - v0.2.0

## Pre-release Verification

- [x] **Architectural Standards**: `CharacterRenderer.tsx` and other renderers use `memo`, `forwardRef`, and `useImperativeHandle`.
- [x] **Rule #2 Compliance**: All blockchain, Web3, and cryptocurrency artifacts removed (including `packages/contracts` and `docs/SMART_CONTRACTS.md`).
- [x] **Version Synchronization**: All `package.json` files in the monorepo bumped to `0.2.0`.
- [x] **Changelog**: `CHANGELOG.md` updated with 0.2.0 release notes.
- [x] **Documentation**: `README.md` updated to remove forbidden content and verify quick start instructions.

## Test Verification

- [x] **Unit Tests**: `pnpm test` passes across all packages.
- [x] **CharacterRenderer**: Specific unit tests for `CharacterRenderer` passing after refactor.
- [x] **Engine Core**: All Phase 1 engine tests passing.
- [x] **Editor UI**: Basic UI component tests passing.

## Quality Assurance

- [x] **Linting**: `pnpm run lint` passes (or minor warnings only).
- [x] **Typechecking**: `pnpm run typecheck` passes without errors.
- [x] **Build**: `pnpm run build` completes successfully.

---
*Prepared by Jules (Release Preparer) - 2026-03-30*
