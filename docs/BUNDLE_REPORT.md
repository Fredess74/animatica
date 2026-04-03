# Bundle Size Report - 2026-04-03

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS (main route) |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 3.4M | +3.32M | Significant growth; full editor UI implemented |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 0K | -8K | No compiled artifacts found |

## Total Size
**~3.54M** (excluding web), **~3.65M** (including web)

## Largest Dependencies
### @Animatica/editor (3.4M)
- `dist/index.js`: 2,181.24 kB
- `dist/index.cjs`: 1,307.75 kB

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.78 kB
- `dist/index.cjs`: 56.64 kB

## Changes
- Updated audit for 2026-04-03.
- `@Animatica/editor` has grown significantly (3.4M) due to the implementation of the full editor UI and R3F components.
- `@Animatica/engine` size has doubled to 135.4K as core logic and renderers were added.
- `@Animatica/web` remains lean with 110K First Load JS.
- `@Animatica/contracts` currently has no compiled output.

## Suggestions
- **@Animatica/editor**: Investigate code-splitting and tree-shaking to reduce the 3.4MB bundle.
- **@Animatica/engine**: Monitor size as Task 11-14 (Characters) are fully integrated.
- **@Animatica/web**: Continue monitoring as more pages are added.
