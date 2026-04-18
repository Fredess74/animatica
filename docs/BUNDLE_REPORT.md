# Bundle Size Report - 2026-04-18

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS (Home route) |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 3.5M | +3.4M | Includes index.js (2.2M) and index.cjs (1.3M) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**3.6M** (excluding web), **3.7M** (including web)

## Largest Dependencies
### @Animatica/editor (3.5M)
- `dist/index.js`: 2,181K
- `dist/index.cjs`: 1,308K
- **CRITICAL**: Significant regression detected. Three.js and React-Three-Fiber dependencies are being bundled into the package instead of being externalized.

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-04-18.
- `@Animatica/engine` size increased following the implementation of Phase 2 features.
- `@Animatica/editor` size regression identified. The package size has jumped from 76K to 3.5M.

## Suggestions
- **@Animatica/editor**: Externalize `three`, `@react-three/fiber`, and `@react-three/drei` in `vite.config.ts`. These should be `peerDependencies` to avoid bundling them in the library output.
- **@Animatica/web**: 110K First Load JS is excellent. Ensure future editor integrations use the externalized dependencies correctly.
