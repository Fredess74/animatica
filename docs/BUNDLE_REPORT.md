# Bundle Size Report - 2026-04-27

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102 kB | 0 kB | First Load JS (stable) |
| **@Animatica/engine** | 135.4 kB | +64.4 kB | Includes index.js (78.8 kB) and index.cjs (56.6 kB) |
| **@Animatica/editor** | 3,489.0 kB | +3,413 kB | **REGRESSION**: Three.js not externalized |
| **@Animatica/platform** | 0.18 kB | -0.02 kB | Minimal exports |
| **@Animatica/contracts** | 0 kB | 0 kB | No compiled output |

## Total Size
**3,624.6 kB** (excluding web), **3,726.6 kB** (including web)

## Largest Dependencies
### @Animatica/editor (3,489.0 kB)
- `dist/index.js`: 2,181.2 kB
- `dist/index.cjs`: 1,307.8 kB
- **Note**: This package is currently bundling `three`, `@react-three/fiber`, and `@react-three/drei`, which should be externalized.

### @Animatica/engine (135.4 kB)
- `dist/index.js`: 78.8 kB
- `dist/index.cjs`: 56.6 kB

## Changes
- Updated audit for 2026-04-27.
- Significant regression detected in `@Animatica/editor` due to missing externalization of Three.js and related libraries.
- `@Animatica/engine` size has grown as more features were implemented.

## Suggestions
- **@Animatica/editor**: **URGENT**: Move `three`, `@react-three/fiber`, and `@react-three/drei` to `peerDependencies` and add them to the `external` list in `vite.config.ts`.
- **@Animatica/engine**: Continue monitoring size; current size is acceptable for a core engine.
- **@Animatica/web**: First Load JS remains stable at 102 kB.
