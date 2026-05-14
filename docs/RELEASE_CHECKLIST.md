# Release Checklist

This document outlines the steps required to prepare and execute a release for the Animatica project.

## Pre-Release Checks

- [ ] **Verify Versioning**: Ensure `version` in the root `package.json` and all workspace `package.json` files are synchronized and bumped correctly according to SemVer.
- [ ] **Update Changelog**: Ensure `CHANGELOG.md` reflects all notable changes since the last release.
- [ ] **Documentation Audit**:
    - [ ] `README.md` has accurate installation and usage instructions.
    - [ ] New features are documented in their respective `docs/` files.
    - [ ] `API_REFERENCE.md` is up to date (if applicable).
- [ ] **Legal & Compliance**:
    - [ ] Run `pnpm licenses list --json > reports/licenses.json` and audit for non-MIT licenses.
    - [ ] Update `docs/LICENSE_AUDIT.md` if necessary.

## Testing & Verification

- [ ] **Install Dependencies**: Run `pnpm install` with a clean state.
- [ ] **Linting**: Run `pnpm lint` and ensure no errors.
- [ ] **Typechecking**: Run `pnpm typecheck` and ensure it passes across all packages.
- [ ] **Unit Tests**: Run `pnpm test` and ensure 100% pass rate.
- [ ] **Build Verification**: Run `pnpm build` to ensure all packages and apps compile successfully.
- [ ] **Smoke Test**: (Optional) Run `pnpm dev` and manually verify core functionality in `apps/web`.

## Release Execution

- [ ] **Merge to Main**: Ensure all changes are merged into the `main` branch.
- [ ] **Create Tag**: Create a git tag for the version (e.g., `git tag v0.1.1`).
- [ ] **Push Changes**: Push the commit and the tag to the remote repository.
- [ ] **GitHub Release**: Create a new release on GitHub using the tag and the changelog entry.

## Post-Release

- [ ] **Verify Artifacts**: Ensure CI/CD pipelines successfully built and deployed artifacts (if applicable).
- [ ] **Notify Team**: Announce the release in relevant communication channels.
