# Release Checklist

Use this checklist to ensure all quality standards are met before a new release.

## 1. Versioning & Package Integrity
- [ ] All `package.json` files have matching versions.
- [ ] Root `package.json` version is updated.
- [ ] `CHANGELOG.md` has an `[Unreleased]` section with all recent changes.
- [ ] No `any` types in public APIs.
- [ ] `pnpm-lock.yaml` is up to date (`pnpm install`).

## 2. Documentation
- [ ] `README.md` is accurate and contains up-to-date install instructions.
- [ ] All new features have corresponding documentation in `docs/`.
- [ ] Forbidden references (blockchain, crypto, etc.) are removed from all public-facing docs.
- [ ] `PROGRESS.md` reflects current state accurately.

## 3. Testing & Validation
- [ ] `pnpm run test` passes across all packages (100% pass rate).
- [ ] `pnpm run typecheck` passes without errors.
- [ ] `pnpm run lint` shows no warnings or errors.
- [ ] Zod schemas are verified against latest sample data.
- [ ] Critical paths (SceneManager, PlaybackController) have unit test coverage.

## 4. UI/UX (Phase 3+)
- [ ] Design tokens (colors, spacing) are consistently applied.
- [ ] Error boundaries are implemented in Canvas components.
- [ ] Fallbacks exist for missing 3D assets.
- [ ] Responsive layouts work on intended breakpoints.

## 5. Pre-Release Finalization
- [ ] `git pull origin main --rebase` performed.
- [ ] All `FIXME` and `TODO` comments addressed or moved to `BACKLOG.md`.
- [ ] Bundle size audit performed (`docs/BUNDLE_REPORT.md` updated).
- [ ] License audit performed (`docs/LICENSE_AUDIT.md` updated).
