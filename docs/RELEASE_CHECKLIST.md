# Release Checklist

This checklist tracks the core verification steps for every Animatica release.

- [x] **Version Consistency**: All `package.json` files must match the target release version.
- [x] **CHANGELOG Status**: `CHANGELOG.md` must be updated with all notable changes and the release date.
- [x] **README Accuracy**: `README.md` must have correct installation and quick start instructions.
- [x] **License Audit**: Ensure all dependencies are documented in `docs/LICENSE_AUDIT.md`.
- [x] **Test/Build Success**: All unit tests (`pnpm test`) and builds (`pnpm build`) must pass.
