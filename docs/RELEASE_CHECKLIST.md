# Release Checklist

Follow these steps for every release of Animatica.

## 1. Preparation
- [ ] Ensure `main` is up to date: `git pull origin main --rebase`
- [ ] Check `docs/PROGRESS.md` to confirm which features are ready for release.
- [ ] Review `docs/BACKLOG.md` and `docs/AGENT_COMPLETED.md`.

## 2. Versioning
- [ ] Determine the next version number based on [Semantic Versioning](https://semver.org/).
- [ ] Update version in the root `package.json`.
- [ ] Update version in all workspace `package.json` files:
    - `packages/engine/package.json`
    - `packages/editor/package.json`
    - `packages/platform/package.json`
    - `apps/web/package.json`
- [ ] Run `pnpm install` to update the lockfile with new versions.

## 3. Changelog
- [ ] Update `CHANGELOG.md` with a new entry for the version and date.
- [ ] Summarize "Added", "Changed", "Fixed", and "Removed" items.
- [ ] Ensure all major features and bug fixes since the last release are included.

## 4. Quality Assurance
- [ ] Run unit tests: `pnpm run test`.
- [ ] Run type checking: `pnpm run typecheck`.
- [ ] Run linting: `pnpm run lint`.
- [ ] Verify build: `pnpm run build`.
- [ ] (Optional) Run end-to-end tests if applicable.

## 5. Documentation
- [ ] Verify `README.md` installation instructions are accurate.
- [ ] Ensure `JULES_GUIDE.md` and other core docs are up to date.
- [ ] Update `docs/PROGRESS.md` to reflect the new release status.

## 6. Final Verification
- [ ] Review the final diff for any accidental changes or debug logs.
- [ ] Ensure no blockchain/Web3 references have crept back in (if applicable).

## 7. Submission
- [ ] Commit with message: `chore(release): vX.Y.Z release preparation`
- [ ] Tag the release in git (if performing the actual release): `git tag vX.Y.Z`
- [ ] Push changes and tags.
