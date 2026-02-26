# Bundle Size Report - 2025-02-22

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | N/A | N/A | Build Failed (Missing Source Code) |
| **@Animatica/engine** | 48K | N/A | Initial Audit |
| **@Animatica/editor** | 12K | N/A | Initial Audit |
| **@Animatica/platform** | 12K | N/A | Initial Audit |
| **@Animatica/contracts** | 8K | N/A | Cache Size |

## Total Size
**72K** (excluding web)

## Largest Dependencies
### @Animatica/engine (48K)
- `dist/index.js`: 24K
- `dist/index.cjs`: 19K

## Changes
- Initial audit.
- Fixed build configuration for `packages/editor`, `packages/platform`, and `packages/contracts`.
- `apps/web` failed to build due to missing source code (`app/` or `pages/`).

## Suggestions
- **@Animatica/engine**: Currently very small (48K). Ensure tree-shaking is enabled in consuming apps.
- **@Animatica/web**: Needs source code to be measurable.
- **@Animatica/editor** & **@Animatica/platform**: Currently minimal/empty. Monitor size as features are added.
