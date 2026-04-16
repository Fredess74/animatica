# Bundle Size Report - 2026-05-23

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (shared) |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 180.9K | +104.9K | Includes index.js (109.5K) and index.cjs (71.4K). Fixed Three.js regression. |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size |

## Total Size
**324.5K** (excluding web), **426.5K** (including web)

## Largest Dependencies
### @Animatica/editor (180.9K)
- `dist/index.js`: 109.5K
- `dist/index.cjs`: 71.4K

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-05-23.
- Resolved major regression in `@Animatica/editor` (was ~3.4 MB) by externalizing `three`, `@react-three/fiber`, and `@react-three/drei`.
- `@Animatica/engine` size increased as more features were added since February.
- `@Animatica/web` remains stable at 102K First Load JS.

## Suggestions
- **@Animatica/engine**: Continue monitoring size; current trend is upward but acceptable.
- **@Animatica/editor**: Ensure Three.js and R3F remain externalized to prevent multi-megabyte bundles.
- **@Animatica/web**: Monitor First Load JS as more shared logic is moved to packages.
