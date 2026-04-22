# Bundle Size Report - 2026-04-22

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS (Home route) |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 3,489.0K | +3,413K | CRITICAL REGRESSION. Non-externalized 3D libraries. |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8.0K | 0K | Cache size (no compiled contracts) |

## Total Size
**3,632.6K** (excluding web), **3,742.6K** (including web)

## Largest Dependencies
### @Animatica/editor (3,489.0K)
- `dist/index.js`: 2,181.2K
- `dist/index.cjs`: 1,307.8K
- *Note: Includes Three.js, R3F, and Drei in bundle.*

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-04-22.
- `@Animatica/web` First Load JS increased slightly to 110K.
- `@Animatica/engine` grew to 135.4K as core logic expanded.
- **CRITICAL**: `@Animatica/editor` has ballooned to 3.5MB. This indicates that `three`, `@react-three/fiber`, and `@react-three/drei` are being bundled instead of being treated as external peer dependencies.

## Suggestions
- **@Animatica/editor**: Immediate action required to externalize 3D dependencies in `vite.config.ts`.
- **@Animatica/engine**: Size remains acceptable for a core engine, but monitor closely.
- **@Animatica/web**: 110K is still very healthy for the main entry point.
