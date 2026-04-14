# Bundle Size Report - 2026-04-14

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | - | First Load JS |
| **@Animatica/engine** | 133.4K | +62.4K | Includes index.js (77K) and index.cjs (56K) |
| **@Animatica/editor** | 177.3K | +101.3K | Includes index.js (107K) and index.cjs (70K) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**318.9K** (excluding web), **420.9K** (including web)

## Largest Dependencies
### @Animatica/editor (177.3K)
- `dist/index.js`: 107K
- `dist/index.cjs`: 70K
- *Note: Resolved a 3.4MB regression by externalizing three, @react-three/fiber, and @react-three/drei.*

### @Animatica/engine (133.4K)
- `dist/index.js`: 77K
- `dist/index.cjs`: 56K

## Changes
- Updated audit for 2026-04-14.
- Fixed major bundle size regression in `@Animatica/editor` by correctly externalizing peer dependencies.
- `@Animatica/engine` size increased as more features were implemented.
- `@Animatica/web` First Load JS remains stable at 102K.

## Suggestions
- **@Animatica/engine**: Continue to monitor as R3F components are added.
- **@Animatica/editor**: Ensure all new heavy dependencies are either essential or externalized if they are peer dependencies.
- **@Animatica/web**: Monitor First Load JS as more editor features are integrated into the main application.
