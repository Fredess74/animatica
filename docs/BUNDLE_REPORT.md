# Bundle Size Report - 2026-03-05

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | FAIL | N/A | Build failed: Next.js compilation errors |
| **@Animatica/engine** | 132K | +61K | Includes index.js (76.8K) and index.cjs (55.2K) |
| **@Animatica/editor** | FAIL | N/A | Build failed: TS2307 (case-sensitivity) and TS6133 errors |
| **@Animatica/platform** | 0.2K | 0K | index.js (55B), index.cjs (124B) |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size (Estimated)
**140.2K** (excluding web/editor), **N/A** (full workspace)

## Largest Dependencies
### @Animatica/engine (132K)
- `dist/index.js`: 76.8K
- `dist/index.cjs`: 55.2K

### @Animatica/editor (FAIL)
- Build failure prevented artifact generation. Previous size was 76K.

## Changes
- Updated audit for 2026-03-05.
- **@Animatica/engine** increased significantly (+61K) due to the addition of `CharacterRenderer`, `BoneController`, and other Phase 2 core components.
- **@Animatica/editor** build is currently broken due to case-sensitivity issues (`@animatica/engine` vs `@Animatica/engine`) and unused variables.
- **@Animatica/web** build failed due to lack of `"use client"` directives in engine components imported into Next.js App Router.

## Suggestions
- **@Animatica/editor**: Fix case-sensitivity imports to restore build and monitoring.
- **@Animatica/engine**: Optimization needed for `CharacterRenderer` if it continues to grow; consider code-splitting or tree-shaking review.
- **@Animatica/web**: Apply `"use client"` to engine entry points or R3F components to fix Next.js build.
