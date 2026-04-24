# Bundle Size Report - 2026-04-24

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS shared by all. / root is 110K. |
| **@Animatica/engine** | 135.42K | +64.42K | Includes index.js (78.78K) and index.cjs (56.64K) |
| **@Animatica/editor** | 180.92K | +104.92K | Includes index.js (109.48K) and index.cjs (71.44K) |
| **@Animatica/platform** | 0.18K | -0.02K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**324.52K** (excluding web), **426.52K** (including web)

## Largest Dependencies
### @Animatica/editor (180.92K)
- `dist/index.js`: 109.48K
- `dist/index.cjs`: 71.44K
- *Note: Optimized by externalizing Three.js and R3F.*

### @Animatica/engine (135.42K)
- `dist/index.js`: 78.78K
- `dist/index.cjs`: 56.64K

## Changes
- Updated audit for 2026-04-24.
- Fixed critical size regression in `@Animatica/editor` by externalizing `three`, `@react-three/fiber`, and `@react-three/drei`.
- Total library size (engine + editor + platform) is now ~316K, well within acceptable limits for a complex 3D application.
- `@Animatica/web` remains stable at ~102K first load JS.

## Suggestions
- **@Animatica/engine**: Monitor size as character animation logic expands.
- **@Animatica/editor**: Keep monitoring UI component weight; currently healthy after optimization.
- **@Animatica/web**: Watch for bloating as new features are integrated into the main app.
