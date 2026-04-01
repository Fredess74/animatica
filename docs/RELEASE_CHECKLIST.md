# Release Checklist

Follow this checklist before every release to ensure the project remains healthy and compliant.

## Pre-Release Checks

- [ ] **Run all tests**: Execute `pnpm run test` from the root and ensure all tests pass in all packages.
- [ ] **Typecheck**: Execute `pnpm run typecheck` to ensure no TypeScript errors.
- [ ] **Lint**: Execute `pnpm run lint` and fix any linting issues.
- [ ] **Version Synchronization**: Verify that all `package.json` files have the same version number.
- [ ] **Changelog**: Ensure `CHANGELOG.md` is updated with the latest changes and the new version.
- [ ] **Rule #2 Compliance**: Perform a global search for forbidden keywords (crypto, blockchain, Web3, NFT, Wei, ETH) and remove any occurrences.
- [ ] **Documentation Review**: Verify that `README.md` and other docs are up to date with current features and instructions.
- [ ] **Dependency Audit**: Check for any newly added non-MIT dependencies that may need a license review.

## Post-Release Verification

- [ ] **Build Artifacts**: Run `pnpm run build` and ensure the build succeeds for all packages and apps.
- [ ] **Live Preview**: Start the development server and verify basic functionality (editor layout, viewport rendering, timeline playback).
- [ ] **Asset Loading**: Ensure sample assets (primitives, characters) load correctly.
- [ ] **Clean Workspace**: Ensure no temporary artifacts or debug files are included in the release.
