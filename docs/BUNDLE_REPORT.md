# Bundle Size Report - 2026-04-05

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 180.9K | +104.9K | Includes index.js (109.5K) and index.cjs (71.4K) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**324.5K** (excluding web), **434.5K** (including web)

## Largest Dependencies
### @Animatica/editor (180.9K)
- `dist/index.js`: 109.5K
- `dist/index.cjs`: 71.4K

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-04-05.
- Fixed a major regression in `@Animatica/editor` by externalizing `three`, `@react-three/fiber`, and `@react-three/drei`. Size reduced from ~3.5MB to 180.9K.
- `@Animatica/engine` size has doubled since the last audit as more renderers and logic were added.
- `@Animatica/web` First Load JS increased slightly to 110K.

## Suggestions
- **@Animatica/engine**: Monitor size closely; consider code-splitting if it exceeds 250K.
- **@Animatica/web**: Perform a `next-bundle-analyzer` run to identify what's contributing to the 110K baseline.
