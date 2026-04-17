# Bundle Size Report - 2026-04-17

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102K | 0K | First Load JS (Next.js 15) |
| **@Animatica/engine** | 133K | +62K | Includes index.js (77K) and index.cjs (56K) |
| **@Animatica/editor** | 177K | +101K | Includes index.js (107K) and index.cjs (70K) |
| **@Animatica/platform** | 0.2K | 0K | Minimal exports only |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size
**318.2K** (excluding web), **420.2K** (including web)

## Largest Dependencies
### @Animatica/editor (177K)
- `dist/index.js`: 107K
- `dist/index.cjs`: 70K
- *Note: Externalized Three.js, R3F, and Drei to reduce size from >2MB.*

### @Animatica/engine (133K)
- `dist/index.js`: 77K
- `dist/index.cjs`: 56K

## Changes
- Updated audit for 2026-04-17.
- **Critical Fix**: Resolved issue where `@Animatica/editor` was bundling Three.js and React Three Fiber. Size reduced from >2,000K to 177K.
- Significant growth in engine and editor logic as core features (Bone Controller, Scene Manager) were implemented.
- Web app First Load JS remains stable at 102K.

## Suggestions
- **@Animatica/engine**: Continue monitoring size; currently at 133K total. Ensure new animation logic doesn't bloat the core.
- **@Animatica/editor**: Now correctly externalizes heavy 3D dependencies. Keep monitoring as more UI panels are added.
- **@Animatica/web**: First Load JS is healthy.
