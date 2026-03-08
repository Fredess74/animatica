# Release Checklist

**Version:** 0.1.0 (Alpha Release)
**Status:** Pre-release verification in progress

## [ ] Pre-Release Checks (Mandatory)

- [x] Version consistency check across all `package.json` files.
- [x] `CHANGELOG.md` updated with latest changes and dates.
- [x] `README.md` reflects current project vision and install instructions.
- [x] All blockchain and crypto references removed from user-facing documentation.
- [x] `docs/WEB3_READINESS.md` created to document the pivot.
- [ ] Ensure `pnpm run install` has been run and lockfile is up to date.

## [ ] Quality Assurance (Automated)

- [ ] All unit tests pass in `@Animatica/engine`.
- [ ] All unit tests pass in `@Animatica/editor`.
- [ ] All unit tests pass in `apps/web`.
- [ ] All TypeScript typechecks pass (`pnpm run typecheck`).
- [ ] No linting errors in the core engine or editor.

## [ ] Documentation Audit

- [ ] All internal links in `docs/` are valid.
- [ ] Architecture diagrams match current directory structures.
- [ ] `JULES_GUIDE.md` instructions are still accurate for new tasks.
- [ ] `PROGRESS.md` completion percentages updated.

## [ ] Build & Artifacts

- [ ] Successful build of `@Animatica/engine`.
- [ ] Successful build of `@Animatica/editor`.
- [ ] Successful build of `apps/web` (Next.js).

---

*Verified by Jules (Release Preparer)*
