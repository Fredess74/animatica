# Bundle Size Report - 2026-03-25

## Package Sizes

| Package | Size | Comparison | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 110K | +8K | First Load JS for / (Next.js 15) |
| **@Animatica/engine** | 135.4K | +64.4K | Includes index.js (78.8K) and index.cjs (56.6K) |
| **@Animatica/editor** | 3,489.0K | +3,413.0K | Significant growth due to UI components and 600+ modules |
| **@Animatica/platform** | 0.18K | -0.02K | Minimal exports |
| **@Animatica/contracts** | 0K | -8K | No build output artifacts found |

## Total Size
**3,624.58K** (excluding web), **3,734.58K** (including web)

## Largest Dependencies
### @Animatica/editor (3,489.0K)
- `dist/index.js`: 2,181.2K
- `dist/index.cjs`: 1,307.8K

### @Animatica/engine (135.4K)
- `dist/index.js`: 78.8K
- `dist/index.cjs`: 56.6K

## Changes
- Updated audit for 2026-03-25.
- `@Animatica/editor` has ballooned to 3.4M following the integration of the full UI component suite and layout system.
- `@Animatica/engine` nearly doubled in size as more renderers and animation logic were added.
- `@Animatica/web` remains relatively stable at 110K First Load JS.

## Suggestions
- **@Animatica/editor**: Investigate code-splitting or lazy loading for the UI library to reduce the initial bundle size. 3.4MB is very high for a library.
- **@Animatica/engine**: Continue to monitor size as Task 11-14 (Characters) are fully integrated.
- **@Animatica/web**: Monitor the impact of importing `@Animatica/editor` on the final application bundle.
