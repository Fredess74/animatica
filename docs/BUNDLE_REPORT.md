# Bundle Size Report - 2026-04-02

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102 kB | 0 kB | First Load JS (Next.js 15.5.12) |
| **@Animatica/engine** | 133 kB | +62 kB | Includes index.js (77 kB) and index.cjs (56 kB) |
| **@Animatica/editor** | 3.4 MB | +3.32 MB | Includes index.js (2.1 MB) and index.cjs (1.3 MB) |
| **@Animatica/platform** | 0.2 kB | 0 kB | Minimal exports only |
| **@Animatica/contracts** | 8 kB | 0 kB | Cache size (no compiled contracts) |

## Total Size
**~3.54 MB** (excluding web), **~3.64 MB** (including web)

## Largest Dependencies
### @Animatica/editor (3.4 MB)
- `dist/index.js`: 2.1 MB
- `dist/index.cjs`: 1.3 MB
- Note: Significant growth due to inclusion of UI components and editor logic.

### @Animatica/engine (133 kB)
- `dist/index.js`: 77 kB
- `dist/index.cjs`: 56 kB
- Note: Includes core R3F components and animation logic.

## Changes
- Updated audit for 2026-04-02.
- `@Animatica/editor` has grown significantly (from ~76 kB to 3.4 MB) as the full 3-panel layout and property panels were implemented.
- `@Animatica/engine` nearly doubled in size (from 71 kB to 133 kB) with the addition of more renderers and the bone controller.
- `apps/web` First Load JS remains stable at 102 kB.

## Suggestions
- **@Animatica/editor**: Investigate tree-shaking and lazy loading for large UI components or icons (e.g., `lucide-react`). 2.1 MB for a JS bundle is large for a web application.
- **@Animatica/engine**: Monitor size as complex humanoid and clothing systems are integrated.
- **@Animatica/web**: Continue to monitor First Load JS as more feature-rich pages are added.
