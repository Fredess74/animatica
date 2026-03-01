# Bundle Size Report - 2026-03-01

## Package Sizes

| Package | Size (JS/ESM) | Size (CJS) | Comparison (Total) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **@Animatica/engine** | 78.60 kB | 56.47 kB | +64 kB | Core engine logic and R3F components |
| **@Animatica/editor** | 2,175.59 kB | 1,303.95 kB | +3,403 kB | Full editor UI and dependencies |
| **@Animatica/platform** | 0.06 kB | 0.12 kB | - | Minimal platform exports |

## Total Size (Packages)
**~3.6 MB** (uncompressed)

## Largest Artifacts
### @Animatica/editor
- `dist/index.js`: 2.18 MB
- `dist/index.cjs`: 1.30 MB

### @Animatica/engine
- `dist/index.js`: 78.60 kB
- `dist/index.cjs`: 56.47 kB

## Changes
- Updated audit for 2026-03-01.
- Significant increase in `@Animatica/editor` size due to full UI implementation and bundled dependencies (Vite build includes many dependencies that were likely externalized or not present in previous reports).
- `@Animatica/engine` size is stable as core features are refined.

## Suggestions
- **@Animatica/editor**: 2.18 MB for the ESM bundle is large. Investigate if more dependencies (like `@react-three/drei` or `three`) can be externalized if they are already provided by the host app (`@Animatica/web`).
- **Optimization**: Implement code splitting for the editor if it's going to be used as a library.
