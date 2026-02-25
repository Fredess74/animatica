# Bundle Analysis Report

**Date:** 2024-05-22
**Agent:** BUNDLE WATCHER
**Scope:** `@Animatica` monorepo

## Overview

This report details the findings from an initial bundle analysis of the Animatica codebase. The primary focus was on identifying unused dependencies, inefficient imports, and potential optimization opportunities.

## Findings

### 1. Unused Dependencies

-   **`lucide-react` in `@Animatica/editor`**:
    -   Listed in `packages/editor/package.json`.
    -   Analysis of `src/` files (`layouts/EditorLayout.tsx`, `panels/*.tsx`, `modals/*.tsx`) indicates that this library is not actively used.
    -   The UI currently relies on emoji icons (e.g., `📦`, `💡`, `📷`) instead of SVG icons.
    -   **Recommendation:** Remove `lucide-react` from `@Animatica/editor` if there are no immediate plans to replace emojis with icons, or implement it to improve UI consistency.

### 2. Inefficient Imports

-   **`three` Imports in `@Animatica/engine`**:
    -   Several renderer components in `packages/engine/src/scene/renderers/` use `import * as THREE from 'three'`.
    -   While `three` is tree-shakeable, using named imports (e.g., `import { Mesh, Vector3 } from 'three'`) is safer and clearer.
    -   **Action:** Refactored `PrimitiveRenderer` and `LightRenderer` to use named imports. `CameraRenderer`, `CharacterRenderer`, and `SpeakerRenderer` are pending optimization to maintain PR file limits.

### 3. Barrel Exports

-   **`@Animatica/engine` Index**:
    -   `packages/engine/src/index.ts` uses `export * from './types/index'` and `export * from './schemas/index'`.
    -   This pattern can sometimes lead to larger bundles if not handled correctly by the bundler, though for types it is harmless.
    -   **Recommendation:** Monitor bundle size. If it grows unexpectedly, switch to named exports.

### 4. Heavy Dependencies

-   **`three`**: Used extensively in `editor`, `engine`, and `web`. Versions are consistent (`0.160.0`).
-   **`tone`**: Used in `engine` for audio. This is a large library.
    -   **Recommendation:** Ensure `Tone.js` is only imported where needed, or consider dynamic imports if audio is an optional feature (though it seems core).

### 5. Duplicate Dependencies

-   Dependencies are well-managed with consistent versions across the workspace.
-   `react`, `react-dom`, `three`, `@react-three/fiber` versions match in all packages.

## Optimizations Applied

-   Refactored `import * as THREE` to named imports in:
    -   `packages/engine/src/scene/renderers/PrimitiveRenderer.tsx`
    -   `packages/engine/src/scene/renderers/LightRenderer.tsx`

## Pending Optimizations

-   `CameraRenderer.tsx`
-   `CharacterRenderer.tsx`
-   `SpeakerRenderer.tsx`

## Next Steps

1.  Complete optimizations for pending renderers.
2.  Evaluate the removal of `lucide-react` from `@Animatica/editor`.
3.  Investigate `tone` usage for tree-shaking opportunities.
