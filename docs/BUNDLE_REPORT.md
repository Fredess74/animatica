# Bundle Size Report - 2026-04-30

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102 kB | 0 kB | First Load JS |
| **@Animatica/engine** | 135.42 kB | +64.42 kB | Includes index.js (78.78 kB) and index.cjs (56.64 kB) |
| **@Animatica/editor** | 3,488.99 kB | +3,412.99 kB | **REGRESSION**: Includes index.js (2,181.24 kB) and index.cjs (1,307.75 kB) |
| **@Animatica/platform** | 0.18 kB | -0.02 kB | Minimal exports only |
| **@Animatica/contracts** | 8 kB | 0 kB | Cache size (no compiled contracts) |

## Total Size
**3,632.59 kB** (excluding web), **3,734.59 kB** (including web)

## Largest Dependencies
### @Animatica/editor (3,488.99 kB)
- `dist/index.js`: 2,181.24 kB
- `dist/index.cjs`: 1,307.75 kB
- **Note**: This size is extremely high because Three.js, @react-three/fiber, and @react-three/drei are currently being bundled into the package instead of being treated as external dependencies.

### @Animatica/engine (135.42 kB)
- `dist/index.js`: 78.78 kB
- `dist/index.cjs`: 56.64 kB

## Changes
- Updated audit for 2026-04-30.
- Major regression identified in `@Animatica/editor` due to bundling of heavy 3D dependencies.
- `@Animatica/engine` size has increased as more features were implemented.

## Suggestions
- **@Animatica/editor**: Immediate action required to externalize `three`, `@react-three/fiber`, and `@react-three/drei` in the vite configuration to reduce bundle size.
- **@Animatica/engine**: Continue to monitor size as core animation features are added.
