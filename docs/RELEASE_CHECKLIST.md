# Release Checklist

## 1. Versioning
- [x] Bump root `package.json` version.
- [x] Sync all `packages/*/package.json` versions.
- [x] Update `CHANGELOG.md` with new version and release notes.

## 2. Documentation
- [x] Verify `README.md` install instructions are up to date.
- [x] Remove any forbidden (Web3/Blockchain) content.
- [x] Ensure all new features are documented in `docs/`.
- [x] Update `docs/PROGRESS.md` to reflect latest completion status.

## 3. Testing
- [x] Run `pnpm run test` and ensure 100% pass rate.
- [x] Run `pnpm run typecheck` and ensure zero errors.
- [ ] Run `pnpm run lint` and ensure no major violations. (Note: ESLint config pending)
- [x] Verify frontend changes with `frontend_verification_instructions` (if applicable).

## 4. Quality & Compliance
- [x] No `any` types in new code.
- [x] No `export default` in new code.
- [x] File lengths under 200 LOC.
- [x] All PR rules followed per `JULES_GUIDE.md`.

## 5. Release Action
- [ ] Tag the release: `git tag vX.Y.Z`.
- [ ] Push tags: `git push origin --tags`.
- [ ] Create GitHub Release with changelog notes.
