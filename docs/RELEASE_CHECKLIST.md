# Release Checklist

## Pre-Release Check (v0.2.0)

- [x] Verify version in `package.json` (root and all packages)
- [x] Update `CHANGELOG.md` with new version and changes
- [x] Verify `README.md` has up-to-date install instructions
- [x] Run all tests (`pnpm test`) and ensure they pass
- [x] Ensure documentation is consistent with code changes
- [x] Verify no forbidden topics (blockchain/web3) are in CHANGELOG/README

## Post-Release

- [ ] Tag the release in git
- [ ] Create GitHub Release
