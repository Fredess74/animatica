# Release Checklist

This checklist ensures that every release of Animatica is stable, documented, and consistent.

## 1. Versioning
- [ ] Verify that all `package.json` files have consistent versions.
- [ ] Ensure the version in the root `package.json` matches the intended release version.
- [ ] Check that `pnpm-lock.yaml` is up to date.

## 2. Documentation
- [ ] `README.md` is up to date with the latest features and installation instructions.
- [ ] `CHANGELOG.md` contains entries for all changes since the last release.
- [ ] `CHANGELOG.md` has the correct date and version for the current release.
- [ ] `docs/PROGRESS.md` reflects the current project state.
- [ ] All internal links in documentation are working.

## 3. Code Quality & Testing
- [ ] Run `pnpm run typecheck` and ensure zero errors.
- [ ] Run `pnpm run lint` and ensure zero errors.
- [ ] Run `pnpm run test` and ensure all tests pass.
- [ ] Check for `TODO` or `FIXME` comments that must be resolved before release.
- [ ] Verify that there are no accidental secrets or API keys in the codebase.

## 4. Build & Verification
- [ ] Run `pnpm run build` to ensure the project builds successfully.
- [ ] Verify that build artifacts are correct.

## 5. Release Approval
- [ ] Obtain approval from the project lead or Conductor.
- [ ] Tag the release in Git (e.g., `git tag v0.1.0`).
- [ ] Push tags to the remote repository.
