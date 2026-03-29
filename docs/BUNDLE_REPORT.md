# Bundle Size Report - 2026-03-29

## Summary

| Package | Raw Size (JS) | Gzip Size (JS) | Comparison |
|---------|---------------|----------------|------------|
| `@Animatica/engine` | 78.78 kB | 22.25 kB | +7.78 kB |
| `@Animatica/editor` | 2,181.24 kB | 477.92 kB | +2,105.24 kB |
| `@Animatica/platform` | 0.06 kB | 0.08 kB | -0.14 kB |
| `@Animatica/web` | 110 kB | - | +8 kB (First Load JS) |

## Detailed Breakdown

### Packages

#### @Animatica/engine
- `dist/index.js`: 78.78 kB (Gzip: 22.25 kB)
- `dist/index.cjs`: 56.64 kB (Gzip: 18.89 kB)

#### @Animatica/editor
- `dist/index.js`: 2,181.24 kB (Gzip: 477.92 kB)
- `dist/index.cjs`: 1,307.75 kB (Gzip: 364.12 kB)

#### @Animatica/platform
- `dist/index.js`: 0.06 kB (Gzip: 0.08 kB)
- `dist/index.cjs`: 0.12 kB (Gzip: 0.14 kB)

### Applications

#### @Animatica/web (Next.js)

| Route | Size | First Load JS |
|-------|------|---------------|
| `/` | 4.87 kB | 110 kB |
| `/_not-found` | 998 B | 103 kB |
| `/editor` | 1.49 kB | 104 kB |
| `/login` | 164 B | 106 kB |
| `/signup` | 164 B | 106 kB |

**Shared Chunks (First Load JS):** 102 kB
- `chunks/743-33720d133c383396.js`: 45.7 kB
- `chunks/8e6518bb-c26e82767f1faf66.js`: 54.2 kB
- Other shared chunks: 2.09 kB

## Changes
- Updated audit for 2026-03-29.
- `@Animatica/editor` has grown significantly (2.1 MB) due to the inclusion of Three.js and complex UI components.
- `@Animatica/engine` remains relatively small at 78 kB.
- `@Animatica/web` First Load JS is at 110 kB.

## Suggestions
- **@Animatica/editor**: The 2.1 MB bundle size is quite large. Investigate code splitting or externalizing Three.js if not already done.
- **@Animatica/engine**: Continue monitoring as more renderers are added.
- **@Animatica/web**: First Load JS is stable, but watch as more routes from `@Animatica/editor` are integrated.
