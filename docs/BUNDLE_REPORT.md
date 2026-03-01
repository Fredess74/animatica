# Bundle Size Report - 2026-03-01

## Package Sizes

| Package | Size (JS/ESM) | Size (CJS) | Comparison (Total) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **@Animatica/engine** | 78.60 kB | 56.47 kB | +64 kB | Core engine logic and R3F components |
| **@Animatica/editor** | 103.88 kB | 67.67 kB | +19.6 kB | Full editor UI (with externalized deps) |
| **@Animatica/platform** | 0.06 kB | 0.12 kB | - | Minimal platform exports |

## Total Size (Packages)
**~306 kB** (uncompressed)

## Largest Artifacts
### @Animatica/editor
- `dist/index.js`: 103.88 kB
- `dist/index.cjs`: 67.67 kB

### @Animatica/engine
- `dist/index.js`: 78.60 kB
- `dist/index.cjs`: 56.47 kB

## Changes
- Updated audit for 2026-03-01.
- Optimized `@Animatica/editor` bundle by properly externalizing peer dependencies (`three`, `@react-three/fiber`, `@react-three/drei`). This reduced the bundle size from ~2.1MB to ~104kB.
- `@Animatica/engine` size is stable as core features are refined.

## Suggestions
- **Dependency Management**: Peer dependencies (`three`, `@react-three/fiber`, `@react-three/drei`) have been added to `external` in `packages/editor/vite.config.ts` to prevent bloating the package bundle.
- **Case Sensitivity**: Some imports in `@Animatica/editor` use `@animatica/engine` instead of `@Animatica/engine`. Both are now externalized to ensure clean builds.
