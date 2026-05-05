# Bundle Size Report - 2026-05-05

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (Stable) |
| **@Animatica/engine** | 133K | +62K | Includes index.js (77K) and index.cjs (56K) |
| **@Animatica/editor** | 3.4M | +3.32M | Significant growth; index.js (2.1M), index.cjs (1.3M) |
| **@Animatica/platform** | 0.17K | -0.03K | Minimal exports |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**3.54M** (excluding web), **3.64M** (including web)

## Largest Dependencies
### @Animatica/editor (3.4M)
- `dist/index.js`: 2.1M
- `dist/index.cjs`: 1.3M
*Note: Large size due to inclusion of many UI components and dependencies.*

### @Animatica/engine (133K)
- `dist/index.js`: 77K
- `dist/index.cjs`: 56K

## Changes
- Updated audit for 2026-05-05.
- `@Animatica/editor` has grown significantly (from 76K to 3.4M) as many features (panels, viewport components) have been added.
- `@Animatica/engine` size has nearly doubled (from 71K to 133K).
- `@Animatica/web` First Load JS remains stable at 102K.

## Suggestions
- **@Animatica/editor**: Investigate tree-shaking and externalizing more dependencies. The 2.1M `index.js` is quite large for a library. Check if `@react-three/drei` or other heavy dependencies are being bundled.
- **@Animatica/engine**: Monitor growth as R3F renderers and animation logic are expanded.
- **@Animatica/web**: Continue monitoring as more pages are added.
