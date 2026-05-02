# Bundle Size Report - 2026-05-02

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102 kB | 0 kB | First Load JS (stable) |
| **@Animatica/engine** | 135.42 kB | +64.42 kB | Includes index.js (78.78 kB) and index.cjs (56.64 kB) |
| **@Animatica/editor** | 3,488.99 kB | +3,412.99 kB | Includes index.js (2,181.24 kB) and index.cjs (1,307.75 kB) |
| **@Animatica/platform** | 0.18 kB | -0.02 kB | Minimal exports only |
| **@Animatica/contracts** | 4 kB | -4 kB | Cache size |

## Total Size
**3,628.59 kB** (excluding web), **3,730.59 kB** (including web)

## Largest Dependencies
### @Animatica/editor (3,488.99 kB)
- `dist/index.js`: 2,181.24 kB
- `dist/index.cjs`: 1,307.75 kB
- **CRITICAL REGRESSION**: Size increased significantly due to bundling Three.js, @react-three/fiber, and @react-three/drei instead of externalizing them.

### @Animatica/engine (135.42 kB)
- `dist/index.js`: 78.78 kB
- `dist/index.cjs`: 56.64 kB

## Changes
- Updated audit for 2026-05-02.
- Major regression detected in `@Animatica/editor`.
- `@Animatica/engine` size has grown as more core features and R3F components were added.
- `@Animatica/web` remains stable at 102 kB First Load JS.

## Suggestions
- **@Animatica/editor**: IMMEDIATELY externalize `three`, `@react-three/fiber`, and `@react-three/drei` in the Vite build configuration to reduce bundle size.
- **@Animatica/engine**: Continue to monitor as animation logic expands.
- **@Animatica/web**: Monitor first-load JS as more editor features are integrated into the main application.
