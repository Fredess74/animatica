# Bundle Size Report - 2026-04-20

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS (Home route) |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 3,489K | +3,413K | **CRITICAL REGRESSION**: Includes index.js (2.18MB) and index.cjs (1.31MB) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Hardhat artifacts and typings |

## Total Size
**3,632.6K** (excluding web), **3,742.6K** (including web)

## Largest Dependencies
### @Animatica/editor (3,489K)
- `dist/index.js`: 2,181.24 kB
- `dist/index.cjs`: 1,307.75 kB
- *Issue*: Three.js, @react-three/fiber, and @react-three/drei are likely bundled instead of being externalized.

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.78 kB
- `dist/index.cjs`: 56.64 kB

## Changes
- Audit for 2026-04-20.
- **CRITICAL**: `@Animatica/editor` has ballooned from 76K to 3.49MB. This is a 45x increase.
- `@Animatica/engine` size has doubled since February as more core components were added.
- `@Animatica/web` remains stable around 110K First Load JS.

## Suggestions
- **@Animatica/editor**: Immediately investigate `vite.config.ts` to ensure `three`, `@react-three/fiber`, and `@react-three/drei` are listed in `build.rollupOptions.external`.
- **@Animatica/engine**: Continue monitoring size. Consider tree-shaking improvements if growth continues at this rate.
- **@Animatica/web**: First Load JS is still healthy.
