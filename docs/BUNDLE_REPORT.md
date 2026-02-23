# Bundle Size Report

**Date:** 2026-02-23
**Agent:** bundle-watcher
**Status:** In Progress

## 1. Import Optimization

### Three.js Refactor
I have refactored the Three.js imports in the following files to replace `import * as THREE` with named imports (tree-shakeable):

- `packages/engine/src/scene/renderers/PrimitiveRenderer.tsx`
- `packages/engine/src/scene/renderers/LightRenderer.tsx`
- `packages/engine/src/scene/renderers/CameraRenderer.tsx`
- `packages/engine/src/scene/renderers/CharacterRenderer.tsx`

**Impact:** This ensures that only the used parts of Three.js (e.g., `Mesh`, `PointLightHelper`, `Group`) are included in the final bundle, rather than potentially including the entire library if the bundler's tree-shaking heuristic fails on the namespace object.

### Barrel Exports
- **Observation:** `packages/engine/src/index.ts` uses `export * as Easing from './animation/easing'`.
- **Recommendation:** If bundle size becomes an issue for consumers only needing one easing function, consider changing this to named exports. For now, it provides a convenient namespace.

## 2. Heavy Dependencies Analysis

### @Animatica/engine
- **`tone` (Tone.js)**:
    - **Usage:** Direct dependency. Tone.js is large.
    - **Recommendation:** If audio is not a core feature for all engine users, consider moving `tone` to a dynamic import (lazy loaded only when `AudioEngine` is initialized) or making it an optional peer dependency.
- **`@react-three/drei`**:
    - **Usage:** Direct dependency. It is very large but generally tree-shakable.
    - **Action:** Ensure that imports from `drei` are always named imports (e.g., `import { Edges } from '@react-three/drei'`), which is currently the case in inspected files.

### @Animatica/editor
- **`lucide-react`**:
    - **Usage:** Used for icons.
    - **Recommendation:** Ensure imports are named (e.g., `import { Play } from 'lucide-react'`) to support tree-shaking.

## 3. Duplicate Dependencies
- **Status:** No duplicate versions found.
- `react`, `react-dom`, `three`, `@react-three/fiber` are consistent across packages.

## 4. Next Steps
- Monitor the bundle size of the `apps/web` build after these changes.
- Investigate lazy loading `AudioEngine` and `Tone.js`.
