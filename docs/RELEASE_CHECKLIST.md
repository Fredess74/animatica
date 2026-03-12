# Release Checklist

This checklist ensures that all necessary steps are taken before a new release is published.

## 1. Versioning & Changelog
- [x] Update `CHANGELOG.md` with new version and date.
- [x] Verify `version` in root `package.json` matches release version.
- [x] Verify `version` in all package `package.json` files matches release version.

## 2. Testing & Verification
- [x] Run `pnpm install` at workspace root to ensure lockfile is up-to-date.
- [x] Run `pnpm run test` and ensure all tests pass.
- [x] Run `pnpm run typecheck` and ensure no TypeScript errors.
- [ ] Run `pnpm run lint` and ensure no linting errors.

## 3. Documentation
- [x] Ensure `README.md` has up-to-date installation and usage instructions.
- [ ] Ensure `JULES_GUIDE.md` reflects current project state and rules.
- [ ] Verify `docs/` contains all necessary architectural and task documentation.

## 4. Compliance & Cleanup
- [x] Perform license audit (`scripts/audit-licenses.js` if available).
- [ ] Ensure no forbidden content (blockchain, Web3, etc.) is present in the codebase.
- [ ] Check for and remove any temporary build artifacts or logs.

## 5. Final Submission
- [ ] Call `pre_commit_instructions` and follow all steps.
- [ ] Submit with a descriptive "chore(release)" commit message.
