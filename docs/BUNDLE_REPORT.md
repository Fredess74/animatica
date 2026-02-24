# Bundle Size Report - 2026-02-24

## Package Sizes

| Package | Size | Comparison (to 2025-02-22) | Notes |
| :--- | :--- | :--- | :--- |
| **@Animatica/web** | 102 kB | NEW | First Load JS (Success) |
| **@Animatica/engine** | 41.5 kB | -6.5 kB | ESM Build |
| **@Animatica/editor** | 45.9 kB | +33.9 kB | ESM Build (Significant growth) |
| **@Animatica/platform** | 0.06 kB | -11.94 kB | Minimal/Empty |
| **@Animatica/contracts** | 0 kB | -8 kB | No contracts compiled |

## Total Size (Estimated)
**~189.5 kB** (Web First Load + Engine + Editor + Platform)
*Note: Consuming apps like @Animatica/web already bundle parts of engine/editor.*

## Largest Dependencies
### @Animatica/editor (45.9 kB)
- `dist/index.js`: 45.91 kB
- `dist/index.cjs`: 30.10 kB

### @Animatica/engine (41.5 kB)
- `dist/index.js`: 41.48 kB
- `dist/index.cjs`: 29.49 kB

## Changes
- Updated audit for 2026-02-24.
- **@Animatica/web**: Successfully built for the first time in an audit. First load JS is 102 kB.
- **@Animatica/editor**: Size increased from 12K to 45.9K, reflecting new features.
- **@Animatica/engine**: Size remains stable around 41-48K.
- **@Animatica/contracts**: Reduced to 0K as no `.sol` files are present.

## Suggestions
- **@Animatica/editor**: Monitor growth as UI components are added. Ensure tree-shaking is effective.
- **@Animatica/web**: 102 kB First Load JS is a good baseline. Keep an eye on `chunks/` growth.
- **@Animatica/contracts**: Add source files to measure actual contract sizes.

---

# Previous Reports

## Bundle Size Report - 2025-02-22

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
