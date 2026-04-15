# Bundle Size Report - 2026-04-15

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (stable) |
| **@Animatica/engine** | 133K | +62K | Includes index.js (77K) and index.cjs (56K) |
| **@Animatica/editor** | 3.4M | +3.3M | MAJOR REGRESSION: Three.js/R3F not externalized |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**~3.5M** (excluding web), **~3.6M** (including web)

## Largest Dependencies
### @Animatica/editor (3.4M)
- `dist/index.js`: 2.1M
- `dist/index.cjs`: 1.3M
- *Note: bundling `three`, `@react-three/fiber`, and `@react-three/drei`*

### @Animatica/engine (133K)
- `dist/index.js`: 77K
- `dist/index.cjs`: 56K

## Changes
- Updated audit for 2026-04-15.
- `@Animatica/engine` grew by ~62K due to new R3F components and animation logic.
- **CRITICAL**: `@Animatica/editor` has a bundle size regression (~3.4 MB). Investigation shows `three`, `@react-three/fiber`, and `@react-three/drei` are being bundled instead of being treated as external dependencies.

## Suggestions
- **@Animatica/editor**: IMMEDIATELY update `vite.config.ts` to externalize `three`, `@react-three/fiber`, and `@react-three/drei`.
- **@Animatica/engine**: Continue monitoring, but current growth is expected given the feature set.
- **@Animatica/web**: First Load JS remains healthy at 102K.
