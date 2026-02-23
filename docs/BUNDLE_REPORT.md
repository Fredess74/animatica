# Bundle Size Report - 2026-02-23

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | NEW | First Load JS (Next.js) |
| **@Animatica/engine** | 69K | +21K | Includes ESM (40K) and CJS (29K) |
| **@Animatica/editor** | 60K | +48K | Includes ESM (36K) and CJS (24K) |
| **@Animatica/platform** | <1K | -11K | Minimal version |
| **@Animatica/contracts** | 8K | 0K | Cache Size (No contracts compiled) |

## Total Size
**239K**

## Largest Dependencies
### @Animatica/web (102K)
- Shared Chunks: 102K
- /: 123 B
- /_not-found: 998 B

### @Animatica/engine (69K)
- `dist/index.js`: 40K
- `dist/index.cjs`: 29K

### @Animatica/editor (60K)
- `dist/index.js`: 36K
- `dist/index.cjs`: 24K

## Changes
- Updated audit for 2026-02-23.
- `@Animatica/web` successfully built and measured for the first time.
- `@Animatica/editor` and `@Animatica/engine` grew as more modules were added (31 modules in engine, 21 in editor).
- Optimized `interpolateKeyframes` in `@Animatica/engine` for better performance with large keyframe sets (added binary search and sort-avoidance).
- `@Animatica/platform` reduced to minimal version.

## Suggestions
- **@Animatica/web**: Monitor shared chunks as they already account for 102K.
- **@Animatica/engine** & **@Animatica/editor**: Growth is expected as features are implemented. Ensure tree-shaking is effective.
- **@Animatica/contracts**: Add smart contracts to begin measuring actual contract size/gas.
