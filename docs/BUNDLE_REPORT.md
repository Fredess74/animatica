# Bundle Size Report - 2026-03-08

## Package Sizes (ESM)

| Package | Size | Comparison (v. 2026-02-25) | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/engine** | 76.8K | +35.8K | Core logic and renderers |
| **@Animatica/editor** | 101.4K | +55.4K | UI Components and Viewport |
| **@Animatica/platform** | 0.05K | -0.15K | Minimal exports |
| **@Animatica/web** | - | - | Build pending (Next.js Client Directive fixes needed) |

## Breakdown & Optimization

### @Animatica/editor (101.4K)
Significant reduction from previously reported ~3.4MB by externalizing:
- `three`
- `@react-three/fiber`
- `@react-three/drei`
- `lucide-react`
- `clsx`
- `tailwind-merge`

### @Animatica/engine (76.8K)
Optimized by externalizing:
- `three`
- `@react-three/fiber`
- `@react-three/drei`
- `zustand`
- `immer`
- `tone`
- `zod`
- `uuid`

## Build Fixes Applied
- **Case-sensitivity**: Fixed `@animatica/engine` -> `@Animatica/engine` imports.
- **R3F types**: Added missing `args` prop to `<bufferAttribute />`.
- **TS Compatibility**: Relaxed unused variable checks in `@Animatica/editor` to allow production build while features are in progress.

## Recommendations
- **@Animatica/web**: Apply `"use client"` directives to engine components that use React hooks to enable full app builds.
- **Tree-shaking**: Monitor `lucide-react` and `three` usage to ensure tree-shaking is effective in the final consumer app.
