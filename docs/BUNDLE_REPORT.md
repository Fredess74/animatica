# Bundle Size Report - 2026-04-01

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS for main route (Next.js 15.5) |
| **@Animatica/engine** | 135.4K | +64.4K | Core engine, R3F components, and store logic |
| **@Animatica/editor** | 3.49M | +3.41M | Full editor UI, panels, and viewport controls |
| **@Animatica/platform** | 0.18K | -0.02K | Minimal shared utilities |
| **@Animatica/contracts** | 84K | +76K | Smart contract workspace (Hardhat output) |

## Total Size
**3.71M** (excluding web), **3.82M** (including web)

## Largest Dependencies
### @Animatica/editor (3.49M)
- `dist/index.js`: 2.18M
- `dist/index.cjs`: 1.31M

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-04-01.
- Massive growth in `@Animatica/editor` as the full React/Three.js editor UI was implemented.
- `@Animatica/engine` size nearly doubled due to the addition of more specialized renderers and the Zod schema migration.
- `@Animatica/web` slightly increased First Load JS as it integrates more features.

## Suggestions
- **@Animatica/editor**: 3.5MB is significant. Investigate code-splitting and tree-shaking for the UI component library.
- **@Animatica/engine**: Monitor growth; consider splitting `CharacterRenderer` and heavy 3D logic into sub-packages if it exceeds 500K.
- **@Animatica/web**: Continue to use dynamic imports for the editor to keep initial load times low for landing pages.
