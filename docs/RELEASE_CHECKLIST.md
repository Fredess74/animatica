# Release Checklist

This checklist ensures all necessary steps are completed before a new release.

## Versioning & Metadata
- [x] Synchronize version across all `package.json` files (Root, Engine, Editor, Platform, Web).
- [x] Update `CHANGELOG.md` with new version, date, and list of changes.
- [x] Ensure `README.md` and `CONTRIBUTING.md` have up-to-date instructions.

## Verification
- [x] Run `pnpm install` to verify dependency integrity.
- [x] Run `pnpm run test` and ensure all tests pass.
- [ ] Run `pnpm run build` to ensure production builds are successful.
- [ ] Run `pnpm run typecheck` to ensure no TypeScript regressions.

## Compliance (Rule #2 - No Web3)
- [ ] Verify that no new Web3/Blockchain/Crypto terminology has been added to user-facing documentation or UI.
- [ ] Ensure `packages/contracts` is kept isolated if still present.

## Documentation
- [x] Update `docs/PROGRESS.md` if significant milestones were reached.
- [x] Review `docs/JULES_GUIDE.md` for any necessary updates to agent instructions.

## Final Submission
- [ ] Commit changes with `chore(release): pre-release check`.
- [ ] Tag the release (if applicable).
