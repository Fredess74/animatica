# Animatica Engine API Reference

The `@Animatica/engine` package is the core runtime for parsing scripts, managing state, and rendering 3D scenes. It is built on **Three.js**, **React Three Fiber (R3F)**, and **Zustand**.

## Table of Contents

- [Store & State Management](#store--state-management)
- [Scene Rendering](#scene-rendering)
- [Animation & Playback](#animation--playback)
- [Script Import](#script-import)

---

## Store & State Management

The engine uses a single Zustand store to manage the entire project state (actors, timeline, environment).

### `useSceneStore`

The main hook to access the state.

```tsx
import { useSceneStore } from '@Animatica/engine';

function MyComponent() {
  const actors = useSceneStore((state) => state.actors);
  const addActor = useSceneStore((state) => state.addActor);

  // Undo/Redo
  const { undo, redo } = useSceneStore.temporal.getState();
}
```

### Selectors

Helper functions to select specific data.

- **`getActorById(id)`**: Returns a selector for a specific actor.
- **`getActiveActors(state)`**: Returns all visible actors.
- **`getCurrentTime(state)`**: Returns current playback time in seconds.

---

## Scene Rendering

The `SceneManager` is the root component that renders the scene. It must be placed inside a R3F `<Canvas>`.

### `SceneManager`

Orchestrates rendering of all actors (Characters, Props, Lights, Cameras) and the environment.

```tsx
import { Canvas } from '@react-three/fiber';
import { SceneManager } from '@Animatica/engine';

<Canvas>
  <SceneManager
    selectedActorId={selectedId}
    onActorSelect={(id) => handleSelect(id)}
    showHelpers={true} // Show light/camera gizmos
  />
</Canvas>
```

### Renderers

Specialized components for each actor type:
- **`PrimitiveRenderer`**: Renders geometric shapes (box, sphere, etc.).
- **`LightRenderer`**: Renders lights (point, spot, sun).
- **`CameraRenderer`**: Renders camera helpers or handles the active view.
- **`CharacterRenderer`**: Renders 3D characters with animation support.

---

## Animation & Playback

### `usePlayback`

A hook to control the animation loop. It synchronizes the `currentTime` in the store with the frame loop.

```tsx
import { usePlayback } from '@Animatica/engine';

const { play, pause, toggle, seek } = usePlayback({
  loop: true,
  speed: 1.0
});
```

### Keyframe Interpolation

The engine automatically interpolates properties between keyframes.
- **Supported Types**: Number, Vector3, Color.
- **Easing**: Linear, Quad, Cubic, Bounce, Elastic.

---

## Script Import

Utilities for loading scenes from JSON scripts.

### `importScript`

Parses and validates a JSON string, returning a `ProjectState` object. Throws specific errors if validation fails.

```typescript
import { importScript, useSceneStore } from '@Animatica/engine';

try {
  const project = importScript(jsonString);
  useSceneStore.setState(project);
} catch (e) {
  console.error("Invalid script:", e.message);
}
```

### `validateScript`

Returns a validation result object (success/failure + errors) without throwing.

---

## Feature Flags

Control experimental features via environment variables (`VITE_FEATURE_FLAG_*`).

```typescript
import { useFeatureFlag } from '@Animatica/engine';

const showAI = useFeatureFlag('ai_prompts');
```
