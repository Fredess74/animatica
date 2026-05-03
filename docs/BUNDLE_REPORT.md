# Bundle Size Report - 2026-05-03

## Package Sizes

| Package | Size (Total JS+CJS) | Comparison (vs 2026-02-25) | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102 kB | 0 kB | First Load JS (stable) |
| **@Animatica/engine** | 135.42 kB | +64.42 kB | Includes index.js (78.78 kB) and index.cjs (56.64 kB) |
| **@Animatica/editor** | 180.92 kB | +104.92 kB | **FIXED**: Externalized Three.js and R3F |
| **@Animatica/platform** | 0.18 kB | -0.02 kB | Minimal exports only |
| **@Animatica/contracts** | 0 kB | -8 kB | No artifacts generated in current build |

## Total Size
**316.52 kB** (excluding web), **418.52 kB** (including web)

## Largest Dependencies
### @Animatica/editor (180.92 kB)
- `dist/index.js`: 109.48 kB
- `dist/index.cjs`: 71.44 kB
- *Note*: Successfully externalized `three`, `@react-three/fiber`, and `@react-three/drei`.

### @Animatica/engine (135.42 kB)
- `dist/index.js`: 78.78 kB
- `dist/index.cjs`: 56.64 kB

## Changes
- Updated audit for 2026-05-03.
- Massive size increase in `@Animatica/editor` was **FIXED** by correctly externalizing heavy 3D libraries in `vite.config.ts`. Size reduced from ~3.5MB to ~181kB.
- `@Animatica/engine` size nearly doubled as core animation and rendering logic matured.
- `@Animatica/contracts` shows 0 size because `hardhat compile` found nothing to compile and `artifacts` were not tracked in the `dist` output for size measurement.

## Suggestions
- **@Animatica/editor**: Size is now under control. Continue monitoring as UI grows.
- **@Animatica/engine**: Monitor growth; consider splitting if it exceeds 250 kB.
- **@Animatica/web**: First Load JS remains healthy at 102 kB.
