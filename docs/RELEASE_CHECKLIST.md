# Release Checklist

This document outlines the standard verification steps required before any release.

- [x] Version synchronization across monorepo (0.2.0)
- [x] CHANGELOG.md updated for 0.2.0
- [x] README.md installation instructions verified
- [x] All unit tests passing (`pnpm test`)
- [ ] All packages typechecked (`pnpm typecheck`)
- [ ] Build process verified (`pnpm build`)
- [ ] No crypto/blockchain keywords in new code (Rule #2)
- [ ] License audit reviewed (`docs/LICENSE_AUDIT.md`)
- [ ] PR rules followed (max 5 files, one package per PR)
