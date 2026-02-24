# Bundle Size Report - 2025-05-27

## Overview
This report analyzes the bundle sizes of the Animatica monorepo packages and applications, identifying areas for optimization.

## Current Bundle Sizes

### Libraries (Production Build - ESM)
- **@Animatica/engine**: 41.48 kB (gzip: ~12.57 kB)
- **@Animatica/editor**: 45.91 kB (gzip: ~10.25 kB)

### Applications (Next.js Production Build)
- **@Animatica/web**: 102 kB (First Load JS)

## Analysis

### 1. Three.js Imports (`packages/engine`)
We identified several files using `import * as THREE from 'three'`, which can prevent tree-shaking in consumer applications if not handled correctly by bundlers.

**Files using `import * as THREE`:**
- `src/scene/renderers/LightRenderer.tsx` (Values & Types)
- `src/scene/renderers/CameraRenderer.tsx` (Values & Types)
- `src/scene/renderers/PrimitiveRenderer.tsx` (Types only)
- `src/scene/renderers/CharacterRenderer.tsx` (Types only)
- `src/scene/renderers/SpeakerRenderer.tsx` (Types only)
- Test files: `LightRenderer.test.tsx`, `CameraRenderer.test.tsx`

**Optimization Strategy:**
Replace namespace imports with named imports.
Example: `import { Object3D, PointLight } from 'three'` instead of `import * as THREE`.

### 2. Tone.js Imports (`packages/engine`)
Tone.js is a large library. While current usage seems minimal, care must be taken to import only necessary modules. No `import * as Tone` was found, but general usage should be monitored.

### 3. Barrel Exports
`packages/engine/src/index.ts` uses `export * from './types/index'` and `export * from './schemas/index'`. While convenient, this can obscure dependency graphs.
Recommend switching to named exports or specific file exports in the future if bundle size increases.

## Action Plan
1.  **Immediate Fix:** Refactor `import * as THREE` in `LightRenderer.tsx` and `CameraRenderer.tsx` to use named imports.
2.  **Follow-up:** Refactor `PrimitiveRenderer.tsx`, `CharacterRenderer.tsx`, and `SpeakerRenderer.tsx` similarly.
3.  **Monitor:** Continue monitoring bundle sizes as features are added.

## Changes in this PR
- Created this report.
- Optimized `LightRenderer.tsx` imports.
