# Bundle Size Report

**Date:** April 9, 2026
**Commit Message:** chore(bundle): size audit

## Summary

This report provides a breakdown of the bundle sizes for all packages and applications within the Animatica monorepo.

## Packages

| Package | Format | Size (Raw) | Size (Gzip) |
|---------|--------|------------|-------------|
| `@Animatica/platform` | ESM | 0.06 kB | 0.08 kB |
| | CJS | 0.12 kB | 0.14 kB |
| `@Animatica/engine` | ESM | 78.78 kB | 22.25 kB |
| | CJS | 56.64 kB | 18.89 kB |
| `@Animatica/editor` | ESM | 109.48 kB | 25.42 kB |
| | CJS | 71.44 kB | 21.56 kB |

> **Note:** Externalized `three`, `@react-three/fiber`, and `@react-three/drei` in `@Animatica/editor` to reduce bundle size from ~2.2 MB to ~109 kB.

## Applications

### `@Animatica/web` (Next.js)

| Route | Size | First Load JS |
|-------|------|---------------|
| `/` | 4.87 kB | 110 kB |
| `/_not-found` | 998 B | 103 kB |
| `/api/auth` | 137 B | 102 kB |
| `/api/export` | 137 B | 102 kB |
| `/api/generate` | 137 B | 102 kB |
| `/api/projects` | 137 B | 102 kB |
| `/api/projects/[id]` | 137 B | 102 kB |
| `/editor` | 1.49 kB | 104 kB |
| `/login` | 164 B | 106 kB |
| `/signup` | 164 B | 106 kB |

**Shared Chunks:**
- First Load JS shared by all: 102 kB
- `chunks/743-33720d133c383396.js`: 45.7 kB
- `chunks/8e6518bb-c26e82767f1faf66.js`: 54.2 kB
- Other shared chunks: 2.09 kB
