# Bundle Size Report - 2026-03-26

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS (Next.js 15) |
| **@Animatica/engine** | 135.4K | +64.4K | index.js (78.8K) + index.cjs (56.6K) |
| **@Animatica/editor** | 3.5M | +3.4M | index.js (2.18M) + index.cjs (1.31M) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**3.64M** (excluding web), **3.75M** (including web)

## Largest Dependencies
### @Animatica/editor (3.5M)
- `dist/index.js`: 2.18M
- `dist/index.cjs`: 1.31M
- *Note: Massive increase due to comprehensive UI components and Three.js integrations.*

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K
- *Note: Growth due to additional R3F renderers and animation logic.*

## Changes
- Updated audit for 2026-03-26.
- `@Animatica/editor` has grown significantly (76K -> 3.5M) as the full editor layout, panels, and Three.js dependencies were integrated.
- `@Animatica/engine` nearly doubled in size (71K -> 135.4K) following the implementation of character renderers and bone controllers.
- `apps/web` First Load JS increased slightly to 110K.

## Suggestions
- **@Animatica/editor**: 3.5M is very large for a library bundle. Investigate code-splitting strategies and ensure heavy dependencies like Three.js are handled efficiently (e.g., as peer dependencies or externalized where possible).
- **@Animatica/engine**: Continue monitoring size; current growth is expected given the feature set.
- **@Animatica/web**: Still well within healthy limits for a Next.js application.
