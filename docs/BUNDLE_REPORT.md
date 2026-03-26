# Bundle Size Report - 2026-03-26

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS (built successfully) |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 3.5M | +3.4M | Includes index.js (2.2M) and index.cjs (1.3M) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 0K | -8K | No compiled contracts |

## Total Size
**3.6M** (excluding web), **3.7M** (including web)

## Largest Dependencies
### @Animatica/editor (3.5M)
- `dist/index.js`: 2.2M
- `dist/index.cjs`: 1.3M

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-03-26.
- Massive growth in `@Animatica/editor` due to UI component library and R3F dependencies.
- `@Animatica/engine` size increased as more core animation features were added.
- `@Animatica/web` remains stable around 110K First Load JS.

## Suggestions
- **@Animatica/editor**: Extremely large bundle size (3.5M). Recommend investigating tree-shaking or dynamic imports for heavy 3D assets and UI components.
- **@Animatica/engine**: Monitor size as more R3F components are added.
- **@Animatica/web**: 110K First Load JS is good, but keep watching as more editor features are integrated into the main application.
