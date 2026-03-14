# Bundle Size Report

This report provides a breakdown of the bundle sizes for the Animatica monorepo packages and applications.

**Date:** 2026-03-14
**Commit:** chore(bundle): size audit

## Summary

| Package/App | Status | Size (Raw) | Size (Gzip) |
| :--- | :--- | :--- | :--- |
| `@Animatica/engine` | ✅ Success | 78.75 kB | 22.32 kB |
| `@Animatica/editor` | ✅ Success | 2.18 MB | 476.59 kB |
| `@Animatica/platform` | ✅ Success | 0.06 kB | 0.08 kB |
| `@Animatica/contracts` | ✅ Success | - | - |
| `apps/web` | ✅ Success | 3.84 MB | - |

---

## Detailed Breakdown

### `@Animatica/engine`
The core engine package is built as an ES module using Vite.
- **Location:** `packages/engine/dist/index.js`
- **Raw Size:** 78.75 kB
- **Gzip Size:** 22.32 kB

### `@Animatica/editor`
The editor UI package is built as an ES module using Vite.
- **Location:** `packages/editor/dist/index.js`
- **Raw Size:** 2.18 MB
- **Gzip Size:** 476.59 kB

### `@Animatica/platform`
The platform bridge package. Currently contains minimal logic.
- **Location:** `packages/platform/dist/index.js`
- **Raw Size:** 0.06 kB
- **Gzip Size:** 0.08 kB

### `apps/web`
The Next.js application.
- **Location:** `apps/web/.next`
- **Estimated JS Size:** ~3.84 MB (Static chunks)
- **Status:** Compiled successfully. Final typechecking failed due to unrelated pre-existing errors in `app/api/projects/[id]/route.ts`.

---

## Technical Changes in this PR
1. **Fix Case-Sensitivity:** Updated all imports of `@animatica/engine` to `@Animatica/engine` in `packages/editor` to match workspace naming conventions.
2. **Next.js Readiness:** Added `"use client"` directives to core engine modules that use React hooks or browser APIs, enabling their use in Next.js Server Components.
3. **Workspace Resolution:** Configured `packages/editor/package.json` with a `main` entry point to allow correct resolution by the Next.js compiler.
4. **CI Robustness:** Resolved `import.meta.env` TypeScript errors and updated `CharacterRenderer.test.tsx` to properly mock React hooks for the `memo(forwardRef(...))` structure.

---

## Recommendations
1. **Directive Consistency:** Continue auditing engine modules for `"use client"` as new R3F components or hooks are added.
2. **Type Cleanup:** Resolve the pre-existing type errors in `apps/web` to ensure clean CI builds.
3. **Automate monitoring:** Integrate this bundle report into the CI pipeline to track size regressions.
