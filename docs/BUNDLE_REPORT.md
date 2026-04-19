# Bundle Size Report - 2026-04-19

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS for home route |
| **@Animatica/engine** | 133K | +62K | Includes index.js (77K) and index.cjs (56K) |
| **@Animatica/editor** | 3.4M | +3.3M | **CRITICAL REGRESSION**: Includes index.js (2.1M) and index.cjs (1.3M) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**3.53M** (excluding web), **3.64M** (including web)

## Largest Dependencies
### @Animatica/editor (3.4M)
- `dist/index.js`: 2.1M
- `dist/index.cjs`: 1.3M
- *Note: Critical regression likely due to non-externalized Three.js/R3F.*

### @Animatica/engine (133K)
- `dist/index.js`: 77K
- `dist/index.cjs`: 56K

## Changes
- Updated audit for 2026-04-19.
- `@Animatica/web` First Load JS increased to 110K.
- `@Animatica/engine` size nearly doubled as more features were implemented.
- **CRITICAL**: `@Animatica/editor` has exploded in size (3.4M). This is a known issue where large 3D dependencies (`three`, `@react-three/fiber`, `@react-three/drei`) are not being externalized in the build.

## Suggestions
- **@Animatica/editor**: **URGENT** Fix `vite.config.ts` to externalize `three`, `@react-three/fiber`, and `@react-three/drei`. Ensure they are listed as `peerDependencies`.
- **@Animatica/engine**: Continue to monitor size; consider code splitting if it exceeds 250K.
- **@Animatica/web**: 110K is still acceptable, but we should investigate what added 8K recently.
