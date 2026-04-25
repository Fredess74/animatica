# Release Checklist

## Versioning
- [x] Root `package.json` version is updated.
- [x] All workspace `package.json` versions are consistent.
- [x] `CHANGELOG.md` has an `[Unreleased]` section with latest changes.

## Documentation
- [x] `README.md` features and tech stack are up to date.
- [x] `README.md` Quick Start instructions are verified.
- [ ] `docs/API_REFERENCE.md` (or equivalent) is updated.
- [x] `docs/PROGRESS.md` reflects current completion status.

## Testing
- [x] `pnpm run test` passes with 100% success rate.
- [x] `pnpm run typecheck` passes with zero errors.
- [ ] `pnpm run lint` passes with no warnings/errors.

## Quality
- [ ] No `any` types in core packages (`engine`, `editor`).
- [ ] No hardcoded English strings in UI (if i18n is active).
- [ ] No TODO/FIXME comments in core logic.
- [x] Blockchain/Web3 references removed (per `JULES_GUIDE.md`).
