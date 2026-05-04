# Release Checklist

This document tracks the steps required for a successful release of Animatica.

## Pre-Release Tasks

- [ ] **Verify Versioning**: All `package.json` files must have the same version.
- [ ] **Update Changelog**: `CHANGELOG.md` must reflect all changes since the last release.
- [ ] **Documentation Audit**:
    - [ ] `README.md` install instructions are accurate.
    - [ ] `JULES_GUIDE.md` is up to date.
    - [ ] `PROGRESS.md` is updated with latest status.
- [ ] **Security/Legal Audit**:
    - [ ] `pnpm licenses list` checked for non-MIT licenses.
    - [ ] `docs/LICENSE_AUDIT.md` updated.
- [ ] **Verify Build**: `pnpm run build` passes for all packages.
- [ ] **Verify Tests**: `pnpm run test` passes for all packages.
- [ ] **Verify Types**: `pnpm run typecheck` passes for all packages.
- [ ] **Bundle Size**: Verify bundle sizes haven't regressed significantly.

## Release Tasks

- [ ] Create a release branch `release/vX.Y.Z`.
- [ ] Tag the release `vX.Y.Z`.
- [ ] Merge to `main`.
- [ ] Deploy to production environment.

## Post-Release Tasks

- [ ] Verify production deployment.
- [ ] Announce release on community channels.
