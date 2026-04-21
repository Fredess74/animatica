# Bundle Size Report - 2026-04-21

## Package Sizes

| Package | Size (Total) | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110 kB | +8 kB | First Load JS (Home route) |
| **@Animatica/engine** | 135.4 kB | +64.4 kB | Optimized for R3F, externalized 3D deps |
| **@Animatica/editor** | 3,489.0 kB | +3,413 kB | **CRITICAL REGRESSION**: Three.js/R3F not externalized |
| **@Animatica/platform** | 0.2 kB | 0 kB | Minimal exports only |
| **@Animatica/contracts** | 8 kB | 0 kB | Cache size (no compiled contracts) |

## Total Size
**3,624.6 kB** (excluding web), **3,734.6 kB** (including web)

## Largest Dependencies
### @Animatica/editor (3,489.0 kB)
- `dist/index.js`: 2,181.2 kB
- `dist/index.cjs`: 1,307.8 kB
- **Root Cause**: `three`, `@react-three/fiber`, and `@react-three/drei` are being bundled into the library instead of being treated as `peerDependencies`.

### @Animatica/engine (135.4 kB)
- `dist/index.js`: 78.8 kB
- `dist/index.cjs`: 56.6 kB

## Changes
- Updated audit for 2026-04-21.
- Identified critical regression in `@Animatica/editor` bundle size.
- `@Animatica/engine` size increased due to additional core logic but remains within acceptable limits for a 3D engine core (externalized Three.js).
- `@Animatica/web` First Load JS remains healthy at 110 kB.

## Suggestions
- **@Animatica/editor**: **URGENT**: Fix `vite.config.ts` to externalize `three`, `@react-three/fiber`, and `@react-three/drei`. They should be listed in `rollupOptions.external`.
- **@Animatica/engine**: Continue monitoring as animation logic grows.
- **@Animatica/web**: Monitor first load JS as more editor components are imported.
