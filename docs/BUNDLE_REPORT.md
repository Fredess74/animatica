# Bundle Size Report - 2026-04-13

## Package Sizes

| Package | Size (JS + CJS) | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS (Next.js 15) |
| **@Animatica/engine** | 135.4K | +64.4K | index.js (78.8K) + index.cjs (56.6K) |
| **@Animatica/editor** | 177.3K | +101.3K | index.js (107K) + index.cjs (70.3K) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports |
| **@Animatica/contracts** | 0K | -8K | No compiled artifacts |

## Total Size
**~313K** (excluding web), **~423K** (including web)

## Largest Dependencies
### @Animatica/editor (177.3K)
- `dist/index.js`: 107K
- `dist/index.cjs`: 70.3K
- **Status:** Resolved. A previous regression caused `three` and R3F to be bundled. These are now correctly externalized.

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Audit for 2026-04-13.
- **Fixed Regression:** `@Animatica/editor` bundle size was reduced from ~3.4MB to ~180K by externalizing `three`, `@react-three/fiber`, and `@react-three/drei` in `vite.config.ts`.
- `@Animatica/engine` size has increased as more core features (Task 6, 21) were implemented.
- `@Animatica/web` First Load JS remains healthy at 110K.

## Suggestions
- **@Animatica/editor**: Ensure any new R3F dependencies are added to the `external` list in `vite.config.ts`.
- **@Animatica/engine**: Continue monitoring; current growth is expected given feature additions, but ensure peer dependencies remain external.
