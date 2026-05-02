# Release Checklist - v0.2.0

## Versioning & Metadata
- [x] Root `package.json` version bumped to `0.2.0`
- [x] `@Animatica/engine` version bumped to `0.2.0`
- [x] `@Animatica/editor` version bumped to `0.2.0`
- [x] `@Animatica/web` version bumped to `0.2.0`
- [x] Removed "Earn" and crypto references from `package.json` descriptions

## Documentation
- [x] `CHANGELOG.md` updated for `0.2.0`
- [x] `README.md` updated (removed forbidden terms, verified install instructions)
- [x] `docs/SMART_CONTRACTS.md` deleted (out of scope)
- [ ] `docs/PROGRESS.md` reflects latest state

## Testing & Quality
- [x] `CharacterRenderer.test.tsx` passing in `@Animatica/engine`
- [x] `Viewport.test.tsx` passing in `@Animatica/editor`
- [x] All monorepo tests passing (`pnpm test`)
- [x] No forbidden blockchain/crypto files remaining in the repo

## Cleanup
- [x] `packages/contracts` directory deleted
