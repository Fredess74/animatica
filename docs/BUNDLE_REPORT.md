# Bundle Size Report - 2026-04-08

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (Next.js 15) |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 180.9K | +104.9K | Includes index.js (109.5K) and index.cjs (71.4K) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 0K | -8K | No artifacts found |

## Total Size
**316.5K** (excluding web), **418.5K** (including web)

## Largest Dependencies
### @Animatica/editor (180.9K)
- `dist/index.js`: 109.5K
- `dist/index.cjs`: 71.4K
- *Note: Resolved regression where Three.js and R3F were being bundled.*

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-04-08.
- Resolved a significant bundle size regression in `@Animatica/editor` by correctly externalizing `three`, `@react-three/fiber`, and `@react-three/drei`.
- `@Animatica/engine` and `@Animatica/editor` continue to grow as Phase 2 and Phase 3 features are implemented.
- `@Animatica/web` remains stable at 102K First Load JS.

## Suggestions
- **@Animatica/engine**: Continue to monitor size as animation and character logic expands.
- **@Animatica/editor**: Ensure all new heavy UI dependencies are either externalized (if peer) or carefully chosen.
- **@Animatica/web**: Monitor first-load JS as more routes and components are added to the main application.
