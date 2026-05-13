# Bundle Size Report - 2026-05-13

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (stable) |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 3.5M | +3.4M | Includes index.js (2.2M) and index.cjs (1.3M) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**3.6M** (excluding web), **3.7M** (including web)

## Largest Dependencies
### @Animatica/editor (3.5M)
- `dist/index.js`: 2,181.24K
- `dist/index.cjs`: 1,307.75K
- **Note:** Significant regression detected. Likely due to inclusion of large UI libraries or 3D assets.

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-05-13.
- Major regression in `@Animatica/editor` (76K -> 3.5M).
- Growth in `@Animatica/engine` as core features are added.
- `@Animatica/web` and `@Animatica/platform` remain stable.

## Suggestions
- **@Animatica/editor**: Immediate audit required to identify the cause of the 3.4M bloat. Check for unoptimized dependencies or bundled assets.
- **@Animatica/engine**: Continue monitoring as more R3F components are integrated.
- **@Animatica/web**: Maintain current First Load JS performance.
