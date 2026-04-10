# Release Checklist

## Version: 0.2.0
**Date:** 2026-04-10

### 1. Versioning & Changelog
- [x] Update root `package.json` version.
- [x] Update all workspace `package.json` versions.
- [x] Update `CHANGELOG.md` with new features, changes, and fixes.
- [x] Verify version consistency across the monorepo.

### 2. Documentation
- [x] Ensure `README.md` has clear install and run instructions.
- [x] Review `JULES_GUIDE.md` for project rules compliance.
- [x] Update `PROGRESS.md` if necessary (handled in regular updates).

### 3. Verification & Testing
- [x] Run `pnpm run test` (Vitest) for all packages.
- [x] Run `pnpm run typecheck` across the monorepo.
- [x] Perform manual verification of key features (if applicable).

### 4. Final Review
- [x] Ensure no "forbidden" topics (e.g., Web3/Crypto) are mentioned in docs (per Rule #2 in `JULES_GUIDE.md`, unless explicitly requested).
- [x] Verify all PR rules (max files, named exports, etc.) are followed.
- [x] Commit with `chore(release): pre-release check`.
