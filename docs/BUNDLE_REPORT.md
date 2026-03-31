# Bundle Size Report - 2026-03-31

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110 kB | +8 kB | First Load JS (Next.js 15) |
| **@Animatica/engine** | 135.4 kB | +64.4 kB | Core logic and renderers |
| **@Animatica/editor** | 3.49 MB | +3.41 MB | Includes full UI and Three.js dependencies |
| **@Animatica/platform** | 0.18 kB | -0.02 kB | Minimal exports only |

## Total Size
**3.63 MB** (excluding web), **3.74 MB** (including web)

## Largest Dependencies
### @Animatica/editor (~3.49 MB)
- `dist/index.js`: 2.1 MB
- `dist/index.cjs`: 1.3 MB
- Includes `@react-three/drei`, `lucide-react`, and `three`.

### @Animatica/engine (135.4 kB)
- `dist/index.js`: 77 kB
- `dist/index.cjs`: 56 kB

## Changes
- Updated audit for 2026-03-31.
- Significant growth in `@Animatica/editor` due to implementation of layout, panels, and Three.js integration.
- `@Animatica/engine` increased as Batch 1 and Batch 2 tasks were completed.
- Rule #2 Compliance: Removed `@Animatica/contracts` from report.

## Suggestions
- **@Animatica/editor**: 3.4 MB is large; consider code-splitting or analyzing which `three` components can be tree-shaken.
- **@Animatica/web**: 110 kB First Load JS is still within acceptable limits for a Next.js application.
