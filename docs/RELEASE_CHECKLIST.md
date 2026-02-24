# Release Checklist

This checklist must be completed before every release to ensure quality and consistency.

## Versioning & Changelog
- [x] Version consistency across all `package.json` files.
- [x] `CHANGELOG.md` updated with the latest changes and correct version.
- [x] Root `package.json` version matches the release version.

## Documentation
- [x] `README.md` updated with correct `pnpm` installation and usage instructions.
- [x] All documentation links are valid.
- [x] `JULES_GUIDE.md` is up to date with the latest coding standards.

## Quality Assurance
- [x] All tests passing (`pnpm test`).
- [x] Typecheck passing (`pnpm typecheck`).
- [ ] Lint passing (`pnpm lint`) - *Currently failing due to missing config, needs investigation.*
- [x] License audit completed (`pnpm run audit-licenses`).
- [x] Build successful for all packages (`pnpm build`).

## Final Verification
- [ ] Manual smoke test of the editor.
- [ ] Manual smoke test of the web app.
- [ ] Verify environment variables in `.env.example`.
