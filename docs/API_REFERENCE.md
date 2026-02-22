# Animatica Engine API Reference

This document provides a comprehensive reference for the `@Animatica/engine` package. The engine handles data models, state management, rendering, animation, and import/export logic.

## Table of Contents

- [Types & Models](#types--models)
- [State Management](#state-management)
- [Renderers (Components)](#renderers-components)
- [Animation](#animation)
- [Script Importer](#script-importer)
- [AI Utilities](#ai-utilities)

---

## Types & Models

Import from `@Animatica/engine/types`.

### Actors

- **Actor**: Union of all actor types.
- **BaseActor**: Common properties (`id`, `name`, `transform`, `visible`, `locked`, `description`).
- **CharacterActor**: Humanoid characters with `animation`, `morphTargets`, `bodyPose`, `clothing`.
- **PrimitiveActor**: Basic shapes (`box`, `sphere`, etc.) with material properties.
- **LightActor**: Lights (`point`, `spot`, `directional`) with `intensity`, `color`, `castShadow`.
- **CameraActor**: Perspective cameras with `fov`, `near`, `far`.
- **SpeakerActor**: Spatial audio sources.

### Scene Data

- **ProjectState**: Complete state including `meta`, `environment`, `actors`, `timeline`.
- **Environment**: `ambientLight`, `sun`, `skyColor`, `fog`, `weather`.
- **Timeline**: `duration`, `cameraTrack`, `animationTracks`.
- **Keyframe**: `time`, `value`, `easing`.

### Geometry & Math

- **Vector3**: `[number, number, number]` tuple.
- **Transform**: `{ position, rotation, scale }`.
- **Color**: Hex string (e.g., `#ff00aa`).

---

## State Management

Import from `@Animatica/engine`.

### `useSceneStore`

The main Zustand store for the application state.

```typescript
const { actors, addActor, playback } = useSceneStore()
```

**Actions:**
- `addActor(actor: Actor): void`
- `removeActor(actorId: string): void`
- `updateActor(id: string, updates: Partial<Actor>): void`
- `setEnvironment(env: Partial<Environment>): void`
- `setTimeline(timeline: Partial<Timeline>): void`
- `setPlayback(playback: Partial<PlaybackState>): void`

**Selectors:**
- `getActorById(id)`: Returns a specific actor.
- `getActiveActors(state)`: Returns visible actors.
- `getCurrentTime(state)`: Returns playback time.

---

## Renderers (Components)

React Three Fiber components for rendering actors.

### `<PrimitiveRenderer />`

Renders basic geometric shapes.

```tsx
<PrimitiveRenderer
  actor={actorData}
  isSelected={boolean}
  onClick={handler}
/>
```

### `<LightRenderer />`

Renders lights and debug helpers.

```tsx
<LightRenderer
  actor={actorData}
  showHelper={boolean}
/>
```

### `<CameraRenderer />`

Renders a camera. Can be the active view or a scene object.

```tsx
<CameraRenderer
  actor={actorData}
  isActive={boolean} // Set as main camera
  showHelper={boolean} // Show frustum
/>
```

---

## Animation

Import from `@Animatica/engine`.

### Easing Functions

Standard easing functions (`linear`, `easeIn`, `easeOut`, `easeInOut`, `bounce`, `elastic`, `step`).

### `interpolateKeyframes`

Calculates a value between keyframes at a specific time.

```typescript
const value = interpolateKeyframes(keyframes, time)
```

- Supports `number`, `Vector3`, `Color`, and discrete types.
- Handles custom easing per keyframe.

### `evaluateTracksAtTime`

Evaluates multiple animation tracks efficiently.

```typescript
const updates = evaluateTracksAtTime(tracks, currentTime)
// Returns Map<TargetId, Map<Property, Value>>
```

---

## Script Importer

Import from `@Animatica/engine`.

### `importScript(jsonString)`

Parses and validates a scene script. Throws if invalid.

```typescript
try {
  const project = importScript(jsonString)
} catch (e) {
  console.error(e)
}
```

### `validateScript(jsonString)`

Returns a validation result object.

```typescript
const { success, errors, data } = validateScript(json)
```

### `tryImportScript(jsonString)`

Safe wrapper returning `{ ok: boolean, ... }`.

---

## AI Utilities

Import from `@Animatica/engine`.

### `getAiPrompt(userIdea, style)`

Generates a system prompt for an LLM to create a scene script.

```typescript
const prompt = getAiPrompt("A cowboy duel at high noon", "Western")
```

**Styles:** `Noir`, `Comedy`, `Horror`, `Anime`, `Cyberpunk`, `Fantasy`, `Documentary`, `Musical`.
