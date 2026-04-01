# Release Checklist

This checklist must be completed before every release to ensure quality and consistency.

## 1. Metadata & Versions
- [ ] **Version Consistency**: Verify all `package.json` files (root, packages/*, apps/*) have the same version number.
- [ ] **Engine Requirement**: Ensure `engines.node` is set to `>=20.0.0` in root `package.json`.
- [ ] **License Audit**: Run `pnpm run audit-licenses` (if available) or verify `docs/LICENSE_AUDIT.md`.

## 2. Documentation
- [ ] **README.md**: Ensure Quick Start instructions are accurate and badges are updated.
- [ ] **CHANGELOG.md**: Ensure all changes since the last release are documented under a new version heading.
- [ ] **API Reference**: Verify JSDoc comments are updated and API docs are regenerated if necessary.

## 3. Verification
- [ ] **Install**: Run `pnpm install` with a clean `node_modules`.
- [ ] **Build**: Run `pnpm run build` from the root and ensure all packages compile.
- [ ] **Typecheck**: Run `pnpm run typecheck` and ensure zero errors.
- [ ] **Tests**: Run `pnpm run test` and ensure all unit/integration tests pass.
- [ ] **Lint**: Run `pnpm run lint` and ensure all code style rules are met.

## 4. Performance & Security
- [ ] **Bundle Size**: Review `docs/BUNDLE_REPORT.md` for any regressions.
- [ ] **Security Scan**: Verify no secrets are committed and Zod schemas are used for all external data.

## 5. Final Steps
- [ ] **Git State**: Ensure all changes are committed and the branch is rebased on `main`.
- [ ] **Tagging**: Prepare to create a git tag (e.g., `v0.1.0`) after merging.
