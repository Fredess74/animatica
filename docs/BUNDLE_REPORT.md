# Bundle Size Report - 2026-05-07

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (Next.js 15) |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 3,489K | +3,413K | **REGRESSION**: 2.1M JS + 1.3M CJS. Dependencies (three, R3F) are being bundled. |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size |

## Total Size
**3,632.6K** (excluding web), **3,734.6K** (including web)

## Largest Dependencies
### @Animatica/editor (3.4M)
- `dist/index.js`: 2.1M
- `dist/index.cjs`: 1.3M
- Note: High weight due to non-externalized `three` and `@react-three/fiber`.

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-05-07.
- `@Animatica/editor` shows a massive increase because `three` and `R3F` are no longer being externalized correctly in the build config.
- `@Animatica/engine` size is increasing as more core features are implemented.

## Suggestions
- **@Animatica/editor**: Externalize `three`, `@react-three/fiber`, and `@react-three/drei` in `vite.config.ts` to reduce bundle size.
- **@Animatica/engine**: Continue to monitor as more renderers are added.
