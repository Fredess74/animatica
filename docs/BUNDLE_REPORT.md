# Bundle Size Report - 2026-04-12

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS (Next.js 15) |
| **@Animatica/engine** | 135K | +64K | Includes index.js (79K) and index.cjs (56K) |
| **@Animatica/editor** | 3.4M | +3.3M | Includes index.js (2.1M) and index.cjs (1.3M) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | <1K | -7K | Minimal cache only |

## Total Size
**3.5M** (excluding web), **3.6M** (including web)

## Largest Dependencies
### @Animatica/editor (3.4M)
- `dist/index.js`: 2.1M
- `dist/index.cjs`: 1.3M
- **Regression:** `three`, `@react-three/fiber`, and `@react-three/drei` are currently bundled instead of being externalized.

### @Animatica/engine (135K)
- `dist/index.js`: 79K
- `dist/index.cjs`: 56K

## Changes
- Updated audit for 2026-04-12.
- Significant regression detected in `@Animatica/editor` (~3.4MB). It appears Three.js and React Three Fiber are being bundled into the library.
- `@Animatica/engine` has grown to 135K as core features and renderers are implemented.

## Suggestions
- **@Animatica/editor**: Add `three`, `@react-three/fiber`, and `@react-three/drei` to the `external` list in `packages/editor/vite.config.ts`.
- **@Animatica/engine**: Monitor growth as characters and more complex renderers are added.
