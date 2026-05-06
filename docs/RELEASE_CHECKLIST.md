# Release Checklist

Use this checklist to verify the project is ready for a new release.

## Versioning
- [x] Version number bumped in root `package.json`.
- [x] Version numbers synced in all package `package.json` files.
- [x] `CHANGELOG.md` updated with the new version and date.
- [ ] Release tag matches the version number (e.g., `v0.2.0`).

## Documentation
- [x] `README.md` reflects the current state of the project and has accurate install instructions.
- [ ] `docs/PROGRESS.md` reflects latest task completions.
- [ ] `docs/ARCHITECTURE.md` is up to date with any major changes.
- [x] All "hallucinated" or out-of-scope documentation (e.g., blockchain) has been removed.

## Testing
- [x] All unit tests pass (`pnpm run test`).
- [ ] All types check out (`pnpm run typecheck`).
- [ ] Linting passes (`pnpm run lint`).
- [x] No regression in core engine benchmarks.

## Quality
- [ ] "Retro Futurism 71" design theme is consistently applied across the UI.
- [ ] Character animations are smooth and correctly interpolated.
- [ ] Viewport gizmos and controls are responsive.
- [ ] AI prompt generation produces valid JSON for the current engine version.

## Final Verification
- [ ] Pre-release build passes successfully (`pnpm run build`).
- [ ] `docs/BUNDLE_REPORT.md` updated with latest bundle sizes.
- [ ] `docs/LICENSE_AUDIT.md` is current and all licenses are acceptable.
