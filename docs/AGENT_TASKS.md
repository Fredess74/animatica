# Agent Task Queue

> This is the central task board for all Jules agents.
> Each agent reads tasks assigned to its ROLE from this file.
> When a task is completed, the agent REMOVES it from here and APPENDS it to `docs/AGENT_COMPLETED.md`.

---

## Tonight's Plan (2026-02-23): Focus on Character Logic (Batch 3) and Editor Wiring (Batch 4)

Tonight, we focus on:
1.  **Engine (Characters):** Implementing the missing character logic (`BoneController`, `MorphTargets`, `ClothingSystem`) and the `Humanoid` component to replace the placeholder renderer.
2.  **Editor (Wiring):** Connecting the existing UI panels (`AssetLibrary`, `PropertiesPanel`, `TimelinePanel`) to the engine store (`useSceneStore`, `usePlayback`).

---

## Batch 3: Characters (Engine)

- [ROLE: engine-char-dev] Create `packages/engine/src/characters/BoneController.ts`. Implement `BoneController` class/functions to map `BodyPose` interface to Three.js bone rotations. Include unit tests.
- [ROLE: engine-char-dev] Create `packages/engine/src/characters/MorphTargets.ts`. Implement logic to apply `MorphTargets` interface values to a SkinnedMesh. Include unit tests.
- [ROLE: engine-char-dev] Create `packages/engine/src/characters/ClothingSystem.ts`. Implement `ClothingSystem` to manage `ClothingSlots` and attach/detach meshes to character bones. Include unit tests.
- [ROLE: engine-char-dev] Create `packages/engine/src/characters/Humanoid.tsx`. Implement `Humanoid` component that loads a GLB model (use a default placeholder URL or prop) and uses Bone/Morph/Clothing controllers. Update `packages/engine/src/scene/renderers/CharacterRenderer.tsx` to use this component instead of the capsule.

## Batch 4: Editor UI Wiring

- [ROLE: editor-wiring-dev] Wire `packages/editor/src/panels/AssetLibrary.tsx` to `useSceneStore`. Implement `handleAddActor` to create real actors (Character, Light, Camera, Primitive) in the store using `addActor`. Use `uuid` for IDs.
- [ROLE: editor-wiring-dev] Wire `packages/editor/src/panels/PropertiesPanel.tsx` to `useSceneStore`. Replace mock inputs with real bindings to the selected actor's properties using `updateActor`. Handle `Transform`, `PrimitiveActor` props, and `LightActor` props.
- [ROLE: editor-wiring-dev] Wire `packages/editor/src/panels/TimelinePanel.tsx` to `usePlayback` and `useSceneStore`. Bind Play/Pause/Stop to `PlaybackController` (via `usePlayback` or store actions). Bind scrubber to `currentTime`. Display real track data from `useSceneStore`.

## Unassigned Tasks

- [ROLE: any] (Conductor adds overflow tasks here for any available agent)
