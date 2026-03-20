# Bundle Size Report - 2026-03-20

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (Next.js 15.5) |
| **@Animatica/engine** | 133K | +62K | Includes index.js (77K) and index.cjs (56K) |
| **@Animatica/editor** | 3.4M | +3.3M | **CRITICAL REGRESSION**: Bundling Three.js |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**~3.5M** (excluding web), **~3.6M** (including web)

## Largest Dependencies
### @Animatica/editor (3.4M)
- `dist/index.js`: 2.1M
- `dist/index.cjs`: 1.3M
- *Note: `three`, `@react-three/fiber`, and `@react-three/drei` are being bundled into the library.*

### @Animatica/engine (133K)
- `dist/index.js`: 77K
- `dist/index.cjs`: 56K

## Changes
- Updated audit for 2026-03-20.
- Massive size increase in `@Animatica/editor` due to dependency bundling.
- `@Animatica/engine` size increased as more components/types were added.

## Suggestions
- **@Animatica/editor**: **CRITICAL** - Add `three`, `@react-three/fiber`, and `@react-three/drei` to `rollupOptions.external` in `packages/editor/vite.config.ts` to prevent bundling these large dependencies.
- **@Animatica/engine**: Continue monitoring; ensure new dependencies are marked as external in the build config.
- **@Animatica/web**: First Load JS stable at 102K, well within budget for a Next.js application.
