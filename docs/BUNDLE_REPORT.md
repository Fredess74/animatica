# Bundle Size Report - 2026-04-06

## Package Sizes

| Package | Size (JS + CJS) | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (Next.js) |
| **@Animatica/engine** | 135.42K | +64.42K | Includes index.js (78.78K) and index.cjs (56.64K) |
| **@Animatica/editor** | 180.92K | +104.92K | Includes index.js (109.48K) and index.cjs (71.44K). Regression fixed. |
| **@Animatica/platform** | 0.18K | -0.02K | index.js (0.06K) + index.cjs (0.12K) |
| **@Animatica/contracts** | 8K | 0K | Hardhat cache/metadata size |

## Total Size
**316.52K** (excluding web), **418.52K** (including web)

## Largest Dependencies
### @Animatica/editor (180.92K)
- `dist/index.js`: 109.48K
- `dist/index.cjs`: 71.44K

### @Animatica/engine (135.42K)
- `dist/index.js`: 78.78K
- `dist/index.cjs`: 56.64K

## Changes
- Updated audit for 2026-04-06.
- Fixed major regression in `@Animatica/editor` (3.4MB -> 181K) by marking `three`, `@react-three/fiber`, and `@react-three/drei` as external.
- `@Animatica/engine` grew significantly due to new renderer logic.
- `@Animatica/web` remains stable at ~102K First Load JS.

## Suggestions
- **@Animatica/engine**: Monitor size as more R3F components are added.
- **@Animatica/editor**: Keep an eye on UI component library weight.
- **@Animatica/web**: First Load JS 102K is good. Watch for bloating as more routes are added.
