# Agent Task Queue

> This is the central task board for all Jules agents.
> Each agent reads tasks assigned to its ROLE from this file.
> When a task is completed, the agent REMOVES it from here and APPENDS it to `docs/AGENT_COMPLETED.md`.

---

## Tonight's Plan (2026-02-24)

Focus on **Phase 2 (Characters)**: implementing the core character system (Bone, Morph, Clothing).
Prioritize **Core Fixes** (PlaybackController) to ensure the animation engine is stable.
Continue **Editor Refinement** and **Integration** tasks.

---

## High Priority: Core Fixes

- [ROLE: engine-playback-dev] Fix `packages/engine/src/playback/PlaybackController.ts`. The current file references undefined variables (`loopRef`, `speedRef`) and has incomplete logic. It must be cleaned up to work correctly with `useSceneStore`.
- [ROLE: engine-test-writer] Write comprehensive tests for the fixed `PlaybackController` in `packages/engine/src/playback/PlaybackController.test.ts`.

## Phase 2: Characters (Active)

- [ROLE: character-dev] Implement `packages/engine/src/characters/BoneController.ts`. Map abstract `BodyPose` data to actual Three.js bone rotations (neck, spine, limbs).
- [ROLE: character-dev] Implement `packages/engine/src/characters/MorphTargets.ts`. Apply facial expressions (joy, anger, etc.) to the mesh's morph targets.
- [ROLE: character-dev] Implement `packages/engine/src/characters/ClothingSystem.ts`. Handle attaching clothing items to specific bone slots (head, torso, legs).
- [ROLE: character-dev] Create `packages/engine/src/characters/Humanoid.tsx`. Main R3F component that loads the GLB, sets up the skeleton, and orchestrates the controllers above.

## Phase 3: Editor Refinement

- [ROLE: editor-layout-dev] Add responsive breakpoints to `packages/editor/src/layouts/EditorLayout.tsx`. Ensure panels collapse or adjust for tablet/mobile.
- [ROLE: editor-components-dev] Create shared UI components in `packages/editor/src/components/ui/` (Button, Input, Select, Slider) to replace raw Tailwind usage and ensure consistency.
- [ROLE: editor-viewport-dev] Refine `packages/editor/src/viewport/Viewport.tsx`. Ensure the Gizmo works correctly (remove `@ts-ignore`) and add transform mode switching (translate/rotate/scale).

## Phase 4: Integration

- [ROLE: integration-dev] Implement `packages/engine/src/export/VideoExporter.tsx`. Use WebCodecs API or MediaRecorder to capture the canvas to video.
- [ROLE: integration-dev] Implement `packages/engine/src/audio/AudioEngine.tsx`. Start the Tone.js integration for spatial audio.

## Quality & Docs

- [ROLE: engine-api-docs] Add JSDoc comments to all exported functions in `packages/engine/src/index.ts`.
- [ROLE: security-auditor] Scan for XSS vectors, unsafe innerHTML, unvalidated inputs.
- [ROLE: accessibility-auditor] Add aria-labels, keyboard navigation, screen reader support in Editor panels.
- [ROLE: ci-guardian] Verify CI pipeline runs correctly, add caching for pnpm.

## Unassigned Tasks

- [ROLE: any] (Conductor adds overflow tasks here for any available agent)
