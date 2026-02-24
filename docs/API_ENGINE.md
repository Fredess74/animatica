# @Animatica/engine API Reference

This document provides a comprehensive reference for the `@Animatica/engine` package, generated from JSDoc comments.

## Table of Contents

- [Types & Models](#types--models)
- [State Management](#state-management)
- [Scene Rendering](#scene-rendering)
- [Playback & Animation](#playback--animation)
- [Script Importer](#script-importer)
- [AI Utilities](#ai-utilities)
- [Configuration](#configuration)

---

## Types & Models

Import from `@Animatica/engine/types`.

### Core Types

#### `Vector3`
A 3D vector represented as a tuple of three numbers `[x, y, z]`.
```typescript
type Vector3 = [number, number, number]
```

#### `Color`
A color string in hexadecimal format (e.g., `"#ff00aa"`).
```typescript
type Color = string
```

#### `UUID`
A unique identifier string (UUID v4).
```typescript
type UUID = string
```

#### `Transform`
Represents the transformation properties of an object in 3D space.
```typescript
interface Transform {
  position: Vector3
  rotation: Vector3
  scale: Vector3
}
```

### Actors

#### `BaseActor`
Base interface for all actors in the scene.
- **id**: `UUID` — Unique identifier.
- **name**: `string` — Human-readable name.
- **transform**: `Transform` — 3D transformation.
- **visible**: `boolean` — Visibility status.
- **locked**: `boolean` (optional) — Prevent accidental edits.
- **description**: `string` (optional) — Description for accessibility.

#### `CharacterActor`
Represents a humanoid character.
- **type**: `'character'`
- **animation**: `AnimationState` — Current animation (e.g., 'idle', 'walk').
- **animationSpeed**: `number` (optional) — Speed multiplier (default: 1).
- **morphTargets**: `MorphTargets` — Facial expression weights.
- **bodyPose**: `BodyPose` — Custom bone rotations.
- **clothing**: `ClothingSlots` — Equipped items.

#### `PrimitiveActor`
Represents a basic geometric shape.
- **type**: `'primitive'`
- **properties**:
  - **shape**: `'box' | 'sphere' | 'cylinder' | 'plane' | 'cone' | 'torus' | 'capsule'`
  - **color**: `Color`
  - **roughness**: `number` (0-1)
  - **metalness**: `number` (0-1)
  - **opacity**: `number` (0-1)
  - **wireframe**: `boolean`

#### `LightActor`
Represents a light source.
- **type**: `'light'`
- **properties**:
  - **lightType**: `'point' | 'spot' | 'directional'`
  - **intensity**: `number`
  - **color**: `Color`
  - **castShadow**: `boolean`

#### `CameraActor`
Represents a camera.
- **type**: `'camera'`
- **properties**:
  - **fov**: `number` (Field of View)
  - **near**: `number` (Near clipping plane)
  - **far**: `number` (Far clipping plane)

### Scene Data

#### `ProjectState`
The complete state of a project.
- **meta**: `ProjectMeta` — Title, description, version.
- **environment**: `Environment` — Lighting, sky, weather.
- **actors**: `Actor[]` — List of all actors.
- **timeline**: `Timeline` — Animation and camera tracks.

#### `Environment`
- **ambientLight**: `{ intensity: number; color: Color }`
- **sun**: `{ position: Vector3; intensity: number; color: Color }`
- **skyColor**: `Color`
- **fog**: `Fog` (optional)
- **weather**: `Weather` (optional)

#### `Timeline`
- **duration**: `number` — Total duration in seconds.
- **cameraTrack**: `CameraCut[]` — Sequence of active cameras.
- **animationTracks**: `AnimationTrack[]` — Keyframe animations.

---

## State Management

Import from `@Animatica/engine`.

### `useSceneStore`
The main Zustand store for managing the scene state. Supports `immer` for immutable updates, `persist` for local storage, and `temporal` for undo/redo.

#### State
- **actors**: `Actor[]`
- **environment**: `Environment`
- **timeline**: `Timeline`
- **playback**: `PlaybackState` ({ currentTime, isPlaying, frameRate })
- **selectedActorId**: `string | null`

#### Actions
- **`addActor(actor: Actor): void`** — Adds a new actor.
- **`removeActor(actorId: string): void`** — Removes an actor by ID.
- **`updateActor(actorId: string, updates: Partial<Actor>): void`** — Updates properties of an actor.
- **`setEnvironment(env: Partial<Environment>): void`** — Updates environment settings.
- **`setTimeline(timeline: Partial<Timeline>): void`** — Updates timeline configuration.
- **`setPlayback(playback: Partial<PlaybackState>): void`** — Updates playback state.
- **`setSelectedActor(id: string | null): void`** — Sets the selected actor.

#### Selectors
- **`getActorById(id)`** — Returns a specific actor.
- **`getActiveActors(state)`** — Returns visible actors.
- **`getCurrentTime(state)`** — Returns current playback time.

---

## Scene Rendering

Import from `@Animatica/engine/scene`.

### `SceneManager`
Orchestrates all scene renderers based on the Zustand store. Handles environment setup and delegates actor rendering to specific sub-renderers.

**Props:**
- **`selectedActorId`**: `string` (optional)
- **`onActorSelect`**: `(id: string) => void`
- **`showHelpers`**: `boolean` — Show debug gizmos.

**Usage:**
```tsx
<Canvas>
  <SceneManager
    selectedActorId={selectedId}
    onActorSelect={handleSelect}
    showHelpers={true}
  />
</Canvas>
```

---

## Playback & Animation

Import from `@Animatica/engine`.

### `usePlayback(options)`
React hook that controls the animation loop using `requestAnimationFrame`.

**Options:**
- **`loop`**: `boolean` (default: false)
- **`speed`**: `number` (default: 1.0)

**Returns:**
- **`play()`**: Start playback.
- **`pause()`**: Pause playback.
- **`stop()`**: Stop and reset to 0.
- **`seek(time)`**: Jump to specific time.
- **`toggle()`**: Toggle play/pause.
- **`setSpeed(speed)`**: Change playback speed.

### `interpolateKeyframes(keyframes, time)`
Interpolates a value at a given time from a sorted array of keyframes.
Supports `number`, `Vector3`, `Color`, and discrete types (via step interpolation).

### `evaluateTracksAtTime(tracks, time)`
Evaluates multiple animation tracks and returns a map of updates.
Returns: `Map<TargetId, Map<PropertyPath, Value>>`

---

## Script Importer

Import from `@Animatica/engine`.

### `importScript(jsonString)`
Validates and imports a scene script. Throws an error if validation fails.

### `validateScript(jsonString)`
Parses and validates a JSON string against the `ProjectStateSchema`.
Returns: `{ success: boolean, errors: string[], data?: ProjectState }`

### `tryImportScript(jsonString)`
Safe wrapper returning `{ ok: boolean, data }` or `{ ok: false, errors }`.

---

## AI Utilities

Import from `@Animatica/engine`.

### `getAiPrompt(userIdea, style)`
Generates a system prompt for an LLM to create a scene script based on a user idea and cinematic style.

**Styles:** `Noir`, `Comedy`, `Horror`, `Anime`, `Cyberpunk`, `Fantasy`, `Documentary`, `Musical`.

**Example:**
```typescript
const prompt = getAiPrompt("A futuristic city chase", "Cyberpunk");
// Returns full system prompt with JSON schema and style guidelines
```

---

## Configuration

Import from `@Animatica/engine`.

### `useFeatureFlag(key)`
Hook to check if a feature flag is enabled.

**Flags:**
- `characters`
- `export`
- `ai_prompts`
- `multiplayer`
- `cloud_sync`

**Example:**
```tsx
const showExport = useFeatureFlag('export');
if (showExport) return <ExportButton />;
```
