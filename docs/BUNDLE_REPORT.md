# Bundle Size Report - 2026-05-08

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 3.4M | +3.3M | Regression: `three` and `R3F` bundled |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**3,632.6K** (excluding web), **3,734.6K** (including web)

## Largest Dependencies
### @Animatica/editor (3.4M)
- `dist/index.js`: 2.1M
- `dist/index.cjs`: 1.3M
- **Issue:** `three`, `@react-three/fiber`, and `@react-three/drei` are being bundled instead of externalized.

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-05-08.
- Major regression in `@Animatica/editor` (76K -> 3.4M) due to Vite config not externalizing heavy 3D dependencies.
- `@Animatica/engine` grew significantly as more renderers and logic were added.
- `@Animatica/web` remains stable at 102K.

## Suggestions
- **@Animatica/editor**: Fix `vite.config.ts` to externalize `three`, `@react-three/fiber`, and `@react-three/drei`.
- **@Animatica/engine**: Monitor growth; consider splitting if it exceeds 200K.
- **@Animatica/web**: Continue to monitor First Load JS.
