# Bundle Size Report - 2026-05-14

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (Next.js 15) |
| **@Animatica/engine** | 135.4K | +64.4K | Growing with R3F components and animation logic |
| **@Animatica/editor** | 3.5M | +3.4M | **REGRESSION**: Massive growth due to UI components and Three.js helpers |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**3.6M** (excluding web), **3.7M** (including web)

## Largest Dependencies
### @Animatica/editor (3.5M)
- `dist/index.js`: 2.1M
- `dist/index.cjs`: 1.3M

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-05-14.
- `@Animatica/editor` has seen a significant increase in size (3.5M), likely due to the inclusion of complex UI libraries or large 3D helpers.
- `@Animatica/engine` size has nearly doubled as core rendering features are implemented.
- `apps/web` remains stable at 102K First Load JS.

## Suggestions
- **@Animatica/editor**: Investigate tree-shaking and component-level code splitting to reduce the 3.5M bundle.
- **@Animatica/engine**: Continue to monitor size as characters and advanced animation systems are added.
- **Performance**: High bundle size for the editor may impact initial load times for contributors.
