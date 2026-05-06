# Bundle Size Report - 2026-05-06

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (Next.js 15) |
| **@Animatica/engine** | 133K | +62K | Includes index.js (77K) and index.cjs (56K) |
| **@Animatica/editor** | 3.4M | +3.3M | Includes index.js (2.1M) and index.cjs (1.3M) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**3,541.2K** (excluding web), **3,643.2K** (including web)

## Largest Dependencies
### @Animatica/editor (3.4M)
- `dist/index.js`: 2.1M
- `dist/index.cjs`: 1.3M
- Note: Regression due to `three` and R3F dependencies being bundled instead of externalized.

### @Animatica/engine (133K)
- `dist/index.js`: 77K
- `dist/index.cjs`: 56K

## Changes
- Updated audit for 2026-05-06.
- `@Animatica/editor` shows a massive regression (~3.4MB), likely due to Three.js and React Three Fiber being bundled into the output.
- `@Animatica/engine` increased as more features (Character/Bone controllers) were added.
- `@Animatica/web` remains stable at 102K First Load JS.

## Suggestions
- **@Animatica/editor**: Investigate `vite.config.ts` to ensure `three`, `@react-three/fiber`, and `@react-three/drei` are correctly externalized.
- **@Animatica/engine**: Continue monitoring size as character system expands.
- **@Animatica/web**: Good performance, maintain low First Load JS.
