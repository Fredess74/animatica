# Bundle Size Report - 2026-04-04

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110 kB | +8 kB | First Load JS |
| **@Animatica/engine** | 135.4 kB | +64.4 kB | Includes index.js (78.8 kB) and index.cjs (56.6 kB) |
| **@Animatica/editor** | 3.5 MB | +3.4 MB | Includes index.js (2.2 MB) and index.cjs (1.3 MB) |
| **@Animatica/platform** | 0.2 kB | 0 kB | Minimal exports only |
| **@Animatica/contracts** | 8 kB | 0 kB | Cache size (no compiled contracts) |

## Total Size
**3.6 MB** (excluding web), **3.7 MB** (including web)

## Largest Dependencies
### @Animatica/editor (3.5 MB)
- `dist/index.js`: 2.2 MB
- `dist/index.cjs`: 1.3 MB
- Note: Significant jump due to inclusion of Three.js and R3F dependencies in the bundle.

### @Animatica/engine (135.4 kB)
- `dist/index.js`: 78.8 kB
- `dist/index.cjs`: 56.6 kB

## Changes
- Updated audit for 2026-04-04.
- `@Animatica/editor` has grown significantly as core UI and 3D features were implemented.
- `@Animatica/engine` size increased with new animation and store features.
- `apps/web` First Load JS increased slightly.

## Suggestions
- **@Animatica/editor**: Audit `vite.config.ts` to ensure `three`, `@react-three/fiber`, and `@react-three/drei` are marked as external if they should be provided by the consumer, or investigate code splitting.
- **@Animatica/engine**: Monitor growth as more logic is added to the core.
- **@Animatica/web**: 110 kB First Load JS is still excellent.
