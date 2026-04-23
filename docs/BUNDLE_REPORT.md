# Bundle Size Report - 2026-04-22

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | Home route First Load JS |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 3,489.0K | +3,413K | CRITICAL REGRESSION: Three.js/R3F not externalized |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 0K | -8K | No compiled artifacts |

## Total Size
**3,624.6K** (excluding web), **3,734.6K** (including web Home)

## Largest Dependencies
### @Animatica/editor (3,489.0K)
- `dist/index.js`: 2,181.2K
- `dist/index.cjs`: 1,307.8K
- *Note: Non-externalized `three`, `@react-three/fiber`, and `@react-three/drei`.*

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-04-22.
- **CRITICAL**: `@Animatica/editor` bundle size exploded from 76K to 3.5MB.
- `vite.config.ts` in `@Animatica/editor` is missing `three`, `@react-three/fiber`, and `@react-three/drei` in the `external` list.
- `@Animatica/engine` size is stable and growing as expected.

## Suggestions
- **URGENT**: Externalize 3D libraries in `@Animatica/editor/vite.config.ts`.
- **Action**: Add `three`, `@react-three/fiber`, and `@react-three/drei` to `rollupOptions.external`.
- **Action**: Ensure these are listed as `peerDependencies` in `@Animatica/editor/package.json`.
