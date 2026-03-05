# Bundle Size Report - 2026-03-05

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | FAIL | N/A | Build failed: Module resolution issues with @Animatica/editor |
| **@Animatica/engine** | 135.5K | +64.5K | Includes index.js (78.6K) and index.cjs (56.9K) |
| **@Animatica/editor** | 3.4M | +3.3M | Includes index.js (2.1M) and index.cjs (1.3M) |
| **@Animatica/platform** | 0.2K | 0K | index.js (55B), index.cjs (124B) |
| **@Animatica/contracts** | 8K | 0K | Cache size (no compiled contracts) |

## Total Size (Estimated)
**~3.5M** (excluding web), **N/A** (full workspace)

## Largest Dependencies
### @Animatica/editor (3.4M)
- `dist/index.js`: 2.1M
- `dist/index.cjs`: 1.3M

### @Animatica/engine (135.5K)
- `dist/index.js`: 78.6K
- `dist/index.cjs`: 56.9K

## Changes
- Updated audit for 2026-03-05.
- **@Animatica/editor** is now building successfully (+3.3M growth). The massive size increase is due to the integration of Three.js and heavy R3F components in the viewport.
- **@Animatica/engine** increased significantly (+64.5K) due to the addition of `CharacterRenderer`, `BoneController`, and other Phase 2 core components.
- Fixed case-sensitivity issues and TypeScript errors that were blocking the build.
- Added workspace-wide ESLint configuration to address linting failures in CI.
- **@Animatica/web** build continues to fail due to module resolution of the local `@Animatica/editor` package in the Next.js build environment.

## Suggestions
- **@Animatica/editor**: Immediate optimization required. 3.4M is extremely heavy for a library. Investigate `peerDependencies` for Three.js and Drei to ensure they aren't being bundled into the library itself.
- **@Animatica/engine**: Monitor size as more R3F components are added.
- **@Animatica/web**: Resolve workspace linking issues to enable full application bundle monitoring.
