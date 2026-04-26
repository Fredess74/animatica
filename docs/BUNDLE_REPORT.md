# Bundle Size Report - 2026-04-26

## Package Sizes

| Package | ES Size (gzip) | CJS Size (gzip) | Change | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102 kB (shared) | N/A | 0K | First Load JS (Next.js 15) |
| **@Animatica/engine** | 78.8 kB (22.3 kB) | 56.6 kB (18.9 kB) | +7.8K | Core engine logic and R3F components |
| **@Animatica/editor** | 2,181.2 kB (477.9 kB) | 1,307.8 kB (364.1 kB) | +2105.2K | **CRITICAL REGRESSION**: Three.js/Drei possibly bundled |
| **@Animatica/platform** | 0.06 kB (0.08 kB) | 0.12 kB (0.14 kB) | -0.14K | Minimal exports only |
| **@Animatica/contracts** | N/A | N/A | -8K | No compiled artifacts in current build |

## Total Size
**3,624.6 kB** (uncompressed ES + CJS total for packages)

## Largest Dependencies

### @Animatica/editor (2.1 MB)
- `dist/index.js`: 2,181.24 kB
- `dist/index.cjs`: 1,307.75 kB
- **Issue**: The bundle size suggests that large peer dependencies (like `three`, `@react-three/fiber`, or `@react-three/drei`) are being bundled into the library instead of being treated as external.

### @Animatica/engine (78.8 kB)
- `dist/index.js`: 78.78 kB
- `dist/index.cjs`: 56.64 kB

## Changes Since Last Audit (2026-02-25)
- `@Animatica/editor` exploded from 76K to 2.1MB.
- `@Animatica/engine` grew slightly from 71K to 78.8K.
- `@Animatica/web` remains stable at 102K First Load JS.
- `@Animatica/contracts` no longer reporting size (no output files found by turbo).

## Suggestions
- **@Animatica/editor**: Immediately investigate `vite.config.ts`. Ensure `three`, `@react-three/fiber`, and `@react-three/drei` are in the `external` list of `rollupOptions`.
- **@Animatica/engine**: Good growth rate, continue monitoring as more features are added.
- **@Animatica/web**: Monitor `app/create` route as it imports the heavy editor package.
