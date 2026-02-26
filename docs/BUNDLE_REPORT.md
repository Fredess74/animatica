# Bundle Size Report - 2026-02-25

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | NEW | First Load JS (built successfully) |
| **@Animatica/engine** | 71K | +23K | Includes index.js (41K) and index.cjs (30K) |
| **@Animatica/editor** | 76K | +64K | Includes index.js (46K) and index.cjs (30K) |
| **@Animatica/platform** | 0.2K | -11.8K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**155.2K** (excluding web), **257.2K** (including web)

## Largest Dependencies
### @Animatica/editor (76K)
- `dist/index.js`: 46K
- `dist/index.cjs`: 30K

### @Animatica/engine (71K)
- `dist/index.js`: 41K
- `dist/index.cjs`: 30K

## Changes
- Updated audit for 2026-02-25.
- `apps/web` now builds successfully using Next.js 15.
- Significant growth in `@Animatica/engine` and `@Animatica/editor` as features are implemented.
- `@Animatica/platform` remains minimal.

## Suggestions
- **@Animatica/engine**: Monitor size as more R3F components are added.
- **@Animatica/editor**: Keep an eye on UI component library weight.
- **@Animatica/web**: 102K First Load JS is good for a Next.js app, but watch for bloating as more routes are added.
