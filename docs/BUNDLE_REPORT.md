# Bundle Size Report - 2026-04-03

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS (Next.js 15.5) |
| **@Animatica/engine** | 133K | +62K | index.js (77K) + index.cjs (56K) |
| **@Animatica/editor** | 3.4M | +3.32M | index.js (2.1M) + index.cjs (1.3M) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports |
| **@Animatica/contracts** | 4K | -4K | Cache only (no Solidity contracts) |

## Total Size
**3.53M** (excluding web), **3.64M** (including web)

## Largest Dependencies
### @Animatica/editor (3.4M)
- `dist/index.js`: 2.1M
- `dist/index.cjs`: 1.3M
- Note: Significant growth due to Three.js, Lucide-React, and UI components.

### @Animatica/engine (133K)
- `dist/index.js`: 77K
- `dist/index.cjs`: 56K

## Changes
- Updated audit for 2026-04-03.
- `@Animatica/editor` has grown significantly (from 76K to 3.4M) as the full 3-panel layout and property panels were implemented.
- `@Animatica/engine` size nearly doubled due to R3F renderer implementations and Zod schemas.
- `@Animatica/web` First Load JS increased slightly to 110K.

## Suggestions
- **@Animatica/editor**: Audit large dependencies (Three.js, Lucide-React). Consider code-splitting or tree-shaking optimizations.
- **@Animatica/engine**: Monitor size as character and clothing systems expand.
- **@Animatica/web**: 110K is still very healthy for a Next.js application.
