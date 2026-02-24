# Animatica Engine API Reference

The `@Animatica/engine` package provides the core business logic, state management, scene graph, and rendering orchestration for the Animatica animation platform.

## Table of Contents

- [Types](#types)
- [Scene Management](#scene-management)
- [Playback & Animation](#playback--animation)
- [Renderers](#renderers)
- [Script Import](#script-import)
- [AI Prompts](#ai-prompts)
- [Configuration](#configuration)
- [Schemas](#schemas)

---

## Types

Core data models are defined in `packages/engine/src/types/index.ts`.

### Actors

*   **`Actor`**: Union of all actor types (`CharacterActor`, `PrimitiveActor`, `LightActor`, `CameraActor`, `SpeakerActor`).
*   **`BaseActor`**: Common properties: `id`, `name`, `transform`, `visible`, `locked`, `description`.
*   **`Transform`**: `{ position: Vector3, rotation: Vector3, scale: Vector3 }`.

### Timeline

*   **`Timeline`**: Contains `duration`, `cameraTrack`, and `animationTracks`.
*   **`Keyframe<T>`**: `{ time: number, value: T, easing?: EasingType }`.
*   **`AnimationTrack`**: `{ targetId: UUID, property: string, keyframes: Keyframe[] }`.

### Environment

*   **`Environment`**: Settings for `ambientLight`, `sun`, `skyColor`, `fog`, `weather`.

---

## Scene Management

### `useSceneStore`

The primary Zustand store for managing the project state.

```typescript
import { useSceneStore } from '@Animatica/engine';

// Selectors
const actors = useSceneStore((state) => state.actors);
const addActor = useSceneStore((state) => state.addActor);

// Actions
useSceneStore.getState().addActor(newActor);
useSceneStore.getState().setEnvironment({ skyColor: '#ff0000' });
```

### `SceneManager`

The main React component that orchestrates rendering. Must be placed inside a generic R3F `<Canvas>`.

```tsx
import { SceneManager } from '@Animatica/engine';

<Canvas>
  <SceneManager
    selectedActorId={selectedId}
    onActorSelect={(id) => handleSelect(id)}
    showHelpers={true}
  />
</Canvas>
```

---

## Playback & Animation

### `usePlayback`

Hook to control the animation loop.

```typescript
import { usePlayback } from '@Animatica/engine';

const { play, pause, seek, stop, toggle } = usePlayback({ loop: true, speed: 1.0 });
```

### `Easing`

Exports standard easing functions: `linear`, `easeIn`, `easeOut`, `easeInOut`, `step`, `bounce`, `elastic`.

### `interpolateKeyframes`

Low-level utility to interpolate a value at a specific time.

```typescript
import { interpolateKeyframes } from '@Animatica/engine';

const value = interpolateKeyframes(track.keyframes, currentTime);
```

---

## Renderers

React Three Fiber components for rendering specific actor types.

*   **`PrimitiveRenderer`**: Renders geometric shapes (box, sphere, etc.).
*   **`LightRenderer`**: Renders lights (point, spot, directional) and gizmos.
*   **`CameraRenderer`**: Renders camera helpers or sets the active camera.
*   **`CharacterRenderer`**: Renders character models (currently placeholders).
*   **`SpeakerRenderer`**: Renders 3D spatial audio sources.

---

## Script Import

### `importScript(jsonString)`

Parses and validates a JSON string against the `ProjectState` schema. Throws if invalid.

### `validateScript(jsonString)`

Returns a `ValidationResult` object with `success: boolean` and a list of `errors`. Safe to use for UI feedback.

---

## AI Prompts

### `getAiPrompt(userIdea, style)`

Generates a structured system prompt for LLMs to generate a valid scene script.

```typescript
import { getAiPrompt, PROMPT_STYLES } from '@Animatica/engine';

const prompt = getAiPrompt("A cowboy duel at high noon", "Western");
```

---

## Configuration

### `FeatureFlagProvider`

React context provider for feature flags.

```tsx
<FeatureFlagProvider initialFlags={{ export: true }}>
  <App />
</FeatureFlagProvider>
```

### `useFeatureFlag(key)`

Hook to check if a feature is enabled.

```typescript
const canExport = useFeatureFlag('export');
```

---

## Schemas

Zod schemas mirroring the TypeScript interfaces, useful for runtime validation.

*   `ProjectStateSchema`
*   `ActorSchema`
*   `TimelineSchema`
*   `EnvironmentSchema`

Example:

```typescript
import { ActorSchema } from '@Animatica/engine';

const result = ActorSchema.safeParse(data);
if (!result.success) {
  console.error(result.error);
}
```
