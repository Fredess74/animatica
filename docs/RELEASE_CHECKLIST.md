# Release Checklist

This checklist ensures that the Animatica project is ready for a new release.

## 1. Versioning & Metadata
- [ ] Verify `version` in root `package.json` matches the intended release.
- [ ] Verify `version` in all `packages/*/package.json` and `apps/*/package.json` are consistent.
- [ ] Ensure `CHANGELOG.md` has a section for the new version with all changes correctly categorized (Added, Changed, Fixed, etc.).
- [ ] Update `docs/PROGRESS.md` to reflect current completion percentages.

## 2. Documentation
- [ ] Ensure `README.md` is up to date with the latest features and installation instructions.
- [ ] Run `pnpm run audit:licenses` (if available) or verify `docs/LICENSE_AUDIT.md`.
- [ ] Update `docs/ARCHITECTURE.md` if any new major components were added.
- [ ] Ensure `docs/API_REFERENCE.md` or other API docs are current.

## 3. Quality & Testing
- [ ] Run `pnpm run typecheck` and ensure zero TypeScript errors across all packages.
- [ ] Run `pnpm run lint` and ensure all linting issues are resolved.
- [ ] Run `pnpm test` and ensure all unit and integration tests pass.
- [ ] Perform a manual smoke test of the main user flows in `apps/web`.
- [ ] Check `docs/BUNDLE_REPORT.md` for any significant regressions in bundle size.

## 4. Environment
- [ ] Verify `.env.example` is up to date with any new environment variables.
- [ ] Ensure all dependencies are correctly locked in `pnpm-lock.yaml`.

## 5. Release Execution
- [ ] Create a release tag (e.g., `v0.1.0`).
- [ ] Merge the release branch into `main`.
- [ ] Verify CI/CD pipeline successfully builds and deploys the release artifacts.
