# Bundle Size Report - 2026-05-09

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (stable) |
| **@Animatica/engine** | 135.4K | +64.4K | Significant growth (index.js: 77K, index.cjs: 56K) |
| **@Animatica/editor** | 3.4M | +3.3M | REGRESSION: `three` and R3F are being bundled |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**3.5M** (excluding web), **3.6M** (including web)

## Largest Dependencies
### @Animatica/editor (3.4M)
- `dist/index.js`: 2.1M
- `dist/index.cjs`: 1.3M
- Note: Vite config needs to externalize `three` and `@react-three/fiber`.

### @Animatica/engine (135.4K)
- `dist/index.js`: 77K
- `dist/index.cjs`: 56K

## Changes
- Updated audit for 2026-05-09.
- `@Animatica/engine` size increased due to additional core logic and types.
- **CRITICAL**: `@Animatica/editor` has experienced a massive size regression (from 76K to 3.4M). This is because `three` and `@react-three/fiber` are being bundled into the package instead of being treated as external dependencies.

## Suggestions
- **@Animatica/editor**: Fix `vite.config.ts` to externalize `three`, `@react-three/fiber`, and `@react-three/drei`.
- **@Animatica/engine**: Continue monitoring size; current growth is acceptable given feature additions.
- **@Animatica/web**: First Load JS remains stable at 102K.
