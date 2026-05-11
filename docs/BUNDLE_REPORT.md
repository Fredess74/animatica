# Bundle Size Report - 2026-05-11

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (shared) |
| **@Animatica/engine** | 135.4K | +64.4K | dist/index.js (78.8K) + dist/index.cjs (56.6K) |
| **@Animatica/editor** | 3,489.0K | +3,413.0K | dist/index.js (2,181K) + dist/index.cjs (1,308K) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports |
| **@Animatica/contracts** | 8K | 0K | Hardhat cache size |

## Total Size
**3,632.6K** (excluding web), **3,734.6K** (including web)

## Largest Dependencies
### @Animatica/editor (3.5M)
- `dist/index.js`: 2,181K
- `dist/index.cjs`: 1,308K
- *Significant regression detected. Investigation required.*

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-05-11.
- **MAJOR REGRESSION**: `@Animatica/editor` has grown from 76K to 3.5M. This is likely due to the inclusion of large UI component libraries or asset imports.
- `@Animatica/engine` has doubled in size as animation and rendering logic was added.
- `@Animatica/web` remains stable.

## Suggestions
- **@Animatica/editor**: Audit `node_modules` and Vite config. Ensure `three` and other large libraries are being properly externalized or tree-shaken.
- **@Animatica/engine**: Check if any unnecessary assets are being bundled into the JS.
- **@Animatica/web**: Continue monitoring as more pages are added.
