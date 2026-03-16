# Backlog

This document tracks all open tasks, issues, and feature requests for the Animatica project. It serves as the single source of truth for development priorities.

## Status: In Progress

### [Task 11] Feat: Humanoid Base
- **Priority:** Medium
- **Type:** Feature (Character)
- **Description:** Implement the `Humanoid` component in `packages/engine/src/characters/Humanoid.tsx`. It should load a ReadyPlayerMe GLB model and display a basic idle animation.
- **Acceptance Criteria:**
  - [ ] Loads GLB model from a URL.
  - [ ] Handles loading states (loading spinner/placeholder).
  - [ ] Handles error states (fallback mesh).
  - [ ] Plays a default idle animation if available.

## Status: Backlog

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

## Status: Done

- **[Task 1] Types & Interfaces:** Defined core TypeScript interfaces.
- **[Task 2] Refactor: Move Zod Schemas:** Moved Zod schema definitions to `packages/engine/src/importer/schemas/`.
- **[Task 3] Easing Functions:** Implemented standard easing functions.
- **[Task 4] Keyframe Engine:** Implemented keyframe interpolation logic.
- **[Task 5] Zustand Store:** Implemented global state management with Immer.
- **[Task 6] Primitive Renderer:** Implemented basic shape rendering.
- **[Task 7] Light Renderer:** Implemented basic light rendering.
- **[Task 8] Camera Renderer:** Implemented basic camera rendering.
- **[Task 9] Scene Manager:** Implemented central scene management.
- **[Task 10] Playback Controller:** Implemented animation playback loop.
- **[Task 21] Script Importer:** Implemented JSON script import and validation (executed out of order).
