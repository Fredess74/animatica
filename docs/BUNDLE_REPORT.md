# Bundle Size Report - 2026-03-30

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS for main route (Next.js 15) |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 3,489K | +3,413K | Massive growth due to 620 modules (R3F, UI components) |
| **@Animatica/platform** | 0.18K | -0.02K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Unchanged (No new compiled artifacts) |

## Total Size
**3,632.6K** (excluding web), **3,742.6K** (including web)

## Largest Dependencies
### @Animatica/editor (3,489K)
- `dist/index.js`: 2,181K
- `dist/index.cjs`: 1,308K

### @Animatica/engine (135K)
- `dist/index.js`: 79K
- `dist/index.cjs`: 56K

## Changes
- Updated audit for 2026-03-30.
- `@Animatica/editor` has grown significantly as Phase 4 (Editor UI) progresses.
- `@Animatica/engine` size increased with addition of renderers and controllers.
- `@Animatica/web` remains stable around 110K First Load JS.

## Suggestions
- **@Animatica/editor**: Investigate tree-shaking and code-splitting for the editor package. 3.4MB is very large for a library.
- **@Animatica/engine**: Continue monitoring as more R3F components are added.
- **@Animatica/web**: Good performance, but watch for shared chunk growth.
