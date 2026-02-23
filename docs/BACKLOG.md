# Backlog

This document tracks all open tasks, issues, and feature requests for the Animatica project. It serves as the single source of truth for development priorities.

## Status: In Progress

### [Task 2] Refactor: Move Zod Schemas
- **Priority:** High
- **Type:** Refactor
- **Description:** Move the Zod schema definitions from `packages/engine/src/schemas/` to `packages/engine/src/importer/schemas/` to align with the project structure defined in `JULES_GUIDE.md`. Update all import references accordingly.
- **Acceptance Criteria:**
  - [ ] `packages/engine/src/importer/schemas/` directory exists.
  - [ ] All schema files are moved to the new location.
  - [ ] All imports in the codebase are updated to the new path.
  - [ ] `pnpm run test` passes without errors.
  - [ ] `pnpm run typecheck` passes without errors.

## Status: Backlog

### [Task 7] Feat: Light Renderer
- **Priority:** High
- **Type:** Feature (Rendering)
- **Description:** Implement the `LightRenderer` component in `packages/engine/src/scene/renderers/LightRenderer.tsx`. This component should render PointLight, SpotLight, and DirectionalLight based on the actor's properties. It must also include a visible helper gizmo when in editor mode.
- **Acceptance Criteria:**
  - [ ] Renders `PointLight`, `SpotLight`, and `DirectionalLight` correctly based on actor type.
  - [ ] Updates light properties (color, intensity, position) from the store.
  - [ ] Displays a helper gizmo (e.g., `PointLightHelper`) when `isSelected` is true or in editor debug mode.
  - [ ] Unit tests pass.

### [Task 8] Feat: Camera Renderer
- **Priority:** High
- **Type:** Feature (Rendering)
- **Description:** Implement the `CameraRenderer` component in `packages/engine/src/scene/renderers/CameraRenderer.tsx`. It should manage the `PerspectiveCamera` for the "rec view" and render a camera helper (frustum wireframe) in the editor view.
- **Acceptance Criteria:**
  - [ ] Renders a `PerspectiveCamera` with `makeDefault` when active.
  - [ ] Renders a `CameraHelper` to visualize the frustum when not active (or in debug mode).
  - [ ] Updates camera transform and FOV from the store.
  - [ ] Unit tests pass.

### [Task 9] Feat: Scene Manager
- **Priority:** High
- **Type:** Feature (Core)
- **Description:** Implement the `SceneManager` component in `packages/engine/src/scene/SceneManager.tsx`. This component acts as the orchestrator, reading actors from the store and dispatching them to the correct renderer (Primitive, Light, Camera, Character). It also handles global environment settings like ambient light, fog, and grid.
- **Acceptance Criteria:**
  - [ ] Subscribes to `useEngineStore` to get the list of actors.
  - [ ] Maps each actor to its corresponding renderer component.
  - [ ] Renders global environment (ambient light, sun light, fog, grid) based on store state.
  - [ ] Integration tests verify actors appear in the scene.

### [Task 10] Feat: Playback Controller
- **Priority:** High
- **Type:** Feature (Animation)
- **Description:** Implement the `PlaybackController` component in `packages/engine/src/animation/PlaybackController.tsx`. This component uses the R3F `useFrame` hook to advance `currentTime` when playing, apply the Keyframe Engine to all tracks, and update actors in the store.
- **Acceptance Criteria:**
  - [ ] Implements `useFrame` loop.
  - [ ] Advances `currentTime` in the store when `isPlaying` is true.
  - [ ] Interpolates values for all tracks using `KeyframeEngine`.
  - [ ] Updates actor properties in the store for the current frame.
  - [ ] Supports pause and seek operations.

### [Task 11] Feat: Humanoid Base
- **Priority:** Medium
- **Type:** Feature (Character)
- **Description:** Implement the `Humanoid` component in `packages/engine/src/characters/Humanoid.tsx`. It should load a ReadyPlayerMe GLB model and display a basic idle animation.
- **Acceptance Criteria:**
  - [ ] Loads GLB model from a URL.
  - [ ] Handles loading states (loading spinner/placeholder).
  - [ ] Handles error states (fallback mesh).
  - [ ] Plays a default idle animation if available.

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
- **[Task 3] Easing Functions:** Implemented standard easing functions.
- **[Task 4] Keyframe Engine:** Implemented keyframe interpolation logic.
- **[Task 5] Zustand Store:** Implemented global state management with Immer.
- **[Task 6] Primitive Renderer:** Implemented basic shape rendering.
- **[Task 21] Script Importer:** Implemented JSON script import and validation (executed out of order).
