# Bundle Size Report - 2026-05-12

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (Next.js 15.5.12) |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 3.5M | +3.4M | **CRITICAL REGRESSION**: Includes index.js (2.2M) and index.cjs (1.3M) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**3.6M** (excluding web), **3.7M** (including web)

## Largest Dependencies
### @Animatica/editor (3.5M)
- `dist/index.js`: 2,181.24 kB
- `dist/index.cjs`: 1,307.75 kB
- Note: Dramatic increase due to implementation of Batch 4 Editor UI components.

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.78 kB
- `dist/index.cjs`: 56.64 kB

## Changes
- Updated audit for 2026-05-12.
- Massive size increase in `@Animatica/editor` as full UI suite (panels, layouts, icons) was implemented.
- `@Animatica/engine` grew by ~90% due to new R3F renderers and animation logic.
- `@Animatica/web` and `@Animatica/platform` remain stable.

## Suggestions
- **@Animatica/editor**: Immediate audit required. Check for heavy dependencies (icons, UI libs) that can be tree-shaken or lazy-loaded.
- **@Animatica/engine**: Continue to monitor; 135K is acceptable but should be kept under 250K if possible.
- **@Animatica/web**: First Load JS is still healthy at 102K.
