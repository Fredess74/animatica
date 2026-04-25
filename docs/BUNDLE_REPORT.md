# Bundle Size Report - 2026-04-25

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (Next.js 15) |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 180.9K | +104.9K | Resolved ~3.5MB regression by externalizing Three.js/R3F |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Contract artifacts |

## Total Size
**324.5K** (excluding web), **426.5K** (including web)

## Largest Dependencies
### @Animatica/editor (180.9K)
- `dist/index.js`: 109.5K
- `dist/index.cjs`: 71.4K
- *Note: Externalized `three`, `@react-three/fiber`, and `@react-three/drei`.*

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-04-25.
- Fixed `@Animatica/editor` bundle size regression (from ~3.5MB to ~181K) by properly externalizing peer dependencies.
- `@Animatica/engine` grew significantly due to new feature implementations.
- `@Animatica/web` remains stable at 102K first load.

## Suggestions
- **@Animatica/engine**: Continue monitoring as more R3F components are added.
- **@Animatica/editor**: Size is now under control after externalization. Ensure new UI dependencies are also externalized if they are heavy.
- **@Animatica/web**: Keep an eye on First Load JS as more routes/islands are added.
