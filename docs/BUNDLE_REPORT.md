# Bundle Size Report - 2026-04-28

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102 kB | 0K | First Load JS (Stable) |
| **@Animatica/engine** | 78.8 kB | +7.8K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 2.1 MB | +2.0M | **REGRESSION**: Bundling Three.js, R3F, and Drei |
| **@Animatica/platform** | 0.1 kB | -0.1K | Minimal exports |
| **@Animatica/contracts** | 0 kB | -8K | No compiled artifacts |

## Total Size
**2.2 MB** (excluding web), **2.3 MB** (including web)

## Largest Dependencies
### @Animatica/editor (2.1 MB)
- `dist/index.js`: 2,181.24 kB
- `dist/index.cjs`: 1,307.75 kB
- **Root Cause**: `three`, `@react-three/fiber`, and `@react-three/drei` are listed in `dependencies` and NOT externalized in `vite.config.ts`.

### @Animatica/engine (78.8 kB)
- `dist/index.js`: 78.78 kB
- `dist/index.cjs`: 56.64 kB

## Changes
- Updated audit for 2026-04-28.
- **CRITICAL**: `@Animatica/editor` has ballooned from 76K to 2.1MB.
- This regression was previously identified in memory (April 27, 2026) and remains unresolved.
- dependencies in `packages/editor/package.json` need to be moved to `peerDependencies` and added to `rollupOptions.external` in `vite.config.ts`.

## Suggestions
- **@Animatica/editor**: Immediate action required to externalize `three` and `@react-three` suites to restore bundle size.
- **@Animatica/engine**: Size is creeping up but remains within acceptable limits (under 100K).
- **@Animatica/web**: Stable at 102 kB First Load JS.
