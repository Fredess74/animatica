# Feature Proposals

## [P-001] Scene Manager (Phase 1 Finalization)

- **Problem:**
  Currently, the engine has individual renderers for Primitives, Lights, and Cameras, but lacks a central component to orchestrate the entire scene. There is no unified way to map the `actors` array in the store to the appropriate R3F components, nor is there a system to apply global environment settings like fog, sky color, and ambient light. This prevents the full scene from being visualized.

- **Solution:**
  Implement `SceneManager.tsx` in `packages/engine/src/scene/`.
  - Subscribe to `useSceneStore` to access `actors` and `environment`.
  - Render a `light` (ambient/directional) and `fog` based on the environment state.
  - Map over `actors` and switch on `actor.type` to render `<PrimitiveRenderer>`, `<LightRenderer>`, or `<CameraRenderer>`.
  - Handle "active camera" logic by passing `isActive` prop to the camera renderer matching the current view.
  - This component will be the main entry point for the `<Canvas>` content.

- **Effort Estimate:** Medium (2-3 days)
- **Priority:** High (Blocking Phase 1 Completion)

## [P-002] Playback Controller (Animation Loop)

- **Problem:**
  The `KeyframeEngine` logic exists in `interpolateKeyframes`, but there is no runtime loop to drive the animation. The `playback.currentTime` state in the store is static unless manually updated. Users cannot play, pause, or seek animations, making the engine static.

- **Solution:**
  Implement `PlaybackController.tsx` in `packages/engine/src/animation/`.
  - Use `useFrame` from R3F to hook into the render loop.
  - Check `store.playback.isPlaying`. If true, increment `currentTime` by `delta`.
  - Call `evaluateTracksAtTime(store.timeline, currentTime)` to get new values for all tracks.
  - Update the store (or a transient ref-based state for performance) with the new values.
  - Handle "looping" or "stop at end" logic based on `timeline.duration`.

- **Effort Estimate:** Medium (3 days)
- **Priority:** High (Blocking Phase 1 Completion)

## [P-003] Humanoid Character Loader (Phase 2 Start)

- **Problem:**
  The engine currently only supports geometric primitives. To fulfill the product vision of storytelling, we need to support humanoid characters. The roadmap (Phase 2) specifies ReadyPlayerMe GLB integration, but no loader or component exists yet.

- **Solution:**
  Implement `Humanoid.tsx` in `packages/engine/src/characters/`.
  - Use `@react-three/drei`'s `useGLTF` to load ReadyPlayerMe avatars from URLs.
  - Implement a fallback for missing/loading models (e.g., a capsule or box).
  - Expose the underlying skeleton to be driven by the future `BoneController`.
  - Support basic `morphTargets` for facial expressions if available in the GLB.

- **Effort Estimate:** High (1 week)
- **Priority:** Medium (Next Milestone)
