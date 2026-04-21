# Release Checklist

This document tracks the requirements for a release. All items must be verified before the final release tag.

## Versioning
- [x] Root `package.json` version matches release target.
- [x] All `packages/*/package.json` versions match release target.
- [x] All `apps/*/package.json` versions match release target.
- [x] `CHANGELOG.md` updated with new version and release date.

## Documentation
- [x] `README.md` has accurate installation and quick start instructions.
- [x] `docs/` are up to date with the latest architectural changes.
- [ ] `LICENSE` and `CONTRIBUTING.md` are present and accurate.

## Testing
- [x] `pnpm run test` passes in all packages.
- [ ] `pnpm run typecheck` passes in all packages.
- [ ] `pnpm run lint` passes in all packages.
- [ ] End-to-end tests (if any) pass.

## Quality & Security
- [x] No `any` types in core packages.
- [x] No `export default` (Named exports only).
- [x] Zod validation implemented for all data imports.
- [x] No blockchain/Web3 residues (as per `JULES_GUIDE.md`).
