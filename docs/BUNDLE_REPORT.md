# Bundle Size Report - 2026-03-22

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS (main route) |
| **@Animatica/engine** | 136K | +65K | Includes index.js (79K) and index.cjs (57K) |
| **@Animatica/editor** | 3.4M | +3.3M | Includes index.js (2.1M) and index.cjs (1.3M) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**~3.5M** (excluding web), **~3.6M** (including web)

## Largest Dependencies
### @Animatica/editor (3.4M)
- `dist/index.js`: 2,181K
- `dist/index.cjs`: 1,308K
- Massive growth due to implementation of full editor UI and 600+ modules.

### @Animatica/engine (136K)
- `dist/index.js`: 79K
- `dist/index.cjs`: 57K
- Growth as more R3F components and animation logic are added.

## Changes
- Updated audit for 2026-03-22.
- `@Animatica/editor` has grown significantly (2.1M for ES build) as it now contains the majority of the UI components.
- `@Animatica/engine` size nearly doubled as core functionality matures.
- `apps/web` First Load JS remains stable around 110K.

## Suggestions
- **@Animatica/editor**: Review UI dependency tree. 2.1M is quite large for a library. Consider code-splitting if not already done, or checking for heavy assets bundled as code.
- **@Animatica/engine**: Continue monitoring, but current size is acceptable for the functionality provided.
- **@Animatica/web**: Good performance, ensure that heavy editor components are lazy-loaded if they aren't needed on the landing page.
