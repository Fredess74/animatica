# Backlog

This document tracks all open tasks, issues, and feature requests for the Animatica project. It serves as the single source of truth for development priorities.

## Status: In Progress

### [Task 12] Feat: Bone Controller
- **Priority:** Medium
- **Type:** Feature (Character)
- **Description:** Implement `BoneController.ts` to map the abstract `bodyPose` object to actual skeleton bone rotations (head, spine, leftArm, rightArm, leftLeg, rightLeg).
- **Acceptance Criteria:**
  - [ ] Function to traverse the GLTF skeleton and find relevant bones.
  - [ ] Applies rotations from `bodyPose` to the bones.
  - [ ] Smoothly interpolates updates if needed.

### [Task 13] Feat: Morph Targets
- **Priority:** Medium
- **Type:** Feature (Character)
- **Description:** Implement `MorphTargets.ts` to apply facial expression morph target influences from the `morphTargets` object to the mesh.
- **Acceptance Criteria:**
  - [ ] Identifies standard ARKit/ReadyPlayerMe morph targets on the mesh.
  - [ ] Updates influence values (0-1) based on store state.

### [Task 14] Feat: Clothing System
- **Priority:** Medium
- **Type:** Feature (Character)
- **Description:** Implement `ClothingSystem.ts` to attach procedural clothing meshes to bone positions.
- **Acceptance Criteria:**
  - [ ] Generates or loads meshes for head, torso, arms, and legs.
  - [ ] Attaches meshes to the correct parent bones in the skeleton.
  - [ ] Supports color customization via material properties.

## Status: Backlog

### [Task 19] Feat: Script Console
- **Priority:** Low
- **Type:** Feature (Editor UI)
- **Description:** Modal with textarea for JSON input. Buttons: Validate, Build Scene, Copy AI Prompt. Shows validation errors inline.
- **Acceptance Criteria:**
  - [ ] Validates JSON input with Zod.
  - [ ] Dispatches store updates on "Build Scene".

### [Task 20] Feat: Export Modal
- **Priority:** Low
- **Type:** Feature (Editor UI)
- **Description:** Resolution selector (1080p/4K), FPS (24/30/60), format (MP4). Start/cancel export. Progress bar.
- **Acceptance Criteria:**
  - [ ] Selection options for resolution and FPS.
  - [ ] Visual progress bar for export.

## Status: Done

- **[Task 1] Types & Interfaces:** Defined core TypeScript interfaces.
- **[Task 2] Refactor: Move Zod Schemas:** Moved schemas to `packages/engine/src/importer/schemas/`.
- **[Task 3] Easing Functions:** Implemented standard easing functions.
- **[Task 4] Keyframe Engine:** Implemented keyframe interpolation logic.
- **[Task 5] Zustand Store:** Implemented global state management with Immer.
- **[Task 6] Primitive Renderer:** Implemented basic shape rendering.
- **[Task 7] Light Renderer:** Implemented light component with helpers.
- **[Task 8] Camera Renderer:** Implemented camera component with helpers.
- **[Task 9] Scene Manager:** Implemented scene orchestration and global environment.
- **[Task 10] Playback Controller:** Implemented animation playback and store updates.
- **[Task 11] Humanoid Base:** Implemented ReadyPlayerMe GLB loader and idle animation.
- **[Task 15] Editor Layout:** Implemented 3-panel layout for the editor.
- **[Task 16] Asset Library:** Implemented categorized list for actor creation.
- **[Task 17] Properties Panel:** Implemented property editing for selected actors.
- **[Task 18] Timeline Panel:** Implemented keyframe scrubber and playback controls.
- **[Task 21] Script Importer:** Implemented JSON script import and validation.
