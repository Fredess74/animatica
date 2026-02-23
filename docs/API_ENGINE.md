# @Animatica/engine API Reference

Public API documentation for the core engine package.

## Types
`import { ... } from '@Animatica/engine/types'`

### Primitives
- **`Vector3`**: `[number, number, number]` - A 3D vector.
- **`Color`**: `string` - A hexadecimal color string (e.g., "#ff00aa").
- **`UUID`**: `string` - A unique identifier (UUID v4).
- **`Transform`**: `{ position: Vector3, rotation: Vector3, scale: Vector3 }`

### Actors
- **`BaseActor`**: Base interface for all actors.
  - `id: UUID`
  - `name: string`
  - `transform: Transform`
  - `visible: boolean`
  - `locked?: boolean`
  - `description?: string`

- **`CharacterActor`**: `BaseActor & { type: 'character', animation: AnimationState, ... }`
- **`PrimitiveActor`**: `BaseActor & { type: 'primitive', properties: { shape: PrimitiveShape, ... } }`
- **`LightActor`**: `BaseActor & { type: 'light', properties: { lightType: LightType, ... } }`
- **`CameraActor`**: `BaseActor & { type: 'camera', properties: { fov: number, ... } }`
- **`SpeakerActor`**: `BaseActor & { type: 'speaker', properties: { audioUrl?: string, ... } }`
- **`Actor`**: Union of all actor types.

### Scene Data
- **`ProjectState`**: The complete state of a project.
  - `meta: ProjectMeta`
  - `environment: Environment`
  - `actors: Actor[]`
  - `timeline: Timeline`
  - `library: { clips: unknown[] }`

---

## Store
`import { useSceneStore } from '@Animatica/engine'`

Zustand store for managing the scene state, including actors, timeline, environment, and playback.

### `useSceneStore()`
Hook to access the store state and actions.

**Example:**
```tsx
const { actors, addActor, updateActor } = useSceneStore()
```

### Actions
- **`addActor(actor: Actor): void`** - Adds a new actor to the scene.
- **`removeActor(actorId: string): void`** - Removes an actor by ID.
- **`updateActor(actorId: string, updates: Partial<Actor>): void`** - Updates properties of an existing actor.
- **`setEnvironment(env: Partial<Environment>): void`** - Updates environment settings.
- **`setTimeline(timeline: Partial<Timeline>): void`** - Updates timeline configuration.
- **`setPlayback(playback: Partial<PlaybackState>): void`** - Updates playback state.
- **`setSelectedActor(id: string | null): void`** - Sets the currently selected actor.

---

## Components (Renderers)
`import { ... } from '@Animatica/engine'`

### `<PrimitiveRenderer />`
Renders a primitive shape (box, sphere, cylinder, etc.).

**Props:**
- `actor: PrimitiveActor`
- `isSelected?: boolean`
- `onClick?: (e: ThreeEvent<MouseEvent>) => void`

### `<LightRenderer />`
Renders a light source (point, spot, directional) with optional helper.

**Props:**
- `actor: LightActor`
- `showHelper?: boolean`

### `<CameraRenderer />`
Renders a perspective camera or helper.

**Props:**
- `actor: CameraActor`
- `isActive?: boolean`
- `showHelper?: boolean`

### `<CharacterRenderer />`
Renders a character actor (currently a capsule placeholder).

**Props:**
- `actor: CharacterActor`
- `isSelected?: boolean`
- `onClick?: (e: ThreeEvent<MouseEvent>) => void`

### `<SceneManager />`
Orchestrates all scene renderers based on the store state.

**Props:**
- `selectedActorId?: string`
- `onActorSelect?: (actorId: string) => void`
- `showHelpers?: boolean`

---

## Animation
`import { ... } from '@Animatica/engine'`

### `interpolateKeyframes(keyframes, time)`
Interpolates a value at a given time from a sorted array of keyframes.

**Parameters:**
- `keyframes: Keyframe<T>[]`
- `time: number`

**Returns:** `T | undefined`

### `evaluateTracksAtTime(tracks, time)`
Evaluates all tracks at a given time.

**Parameters:**
- `tracks: AnimationTrack[]`
- `time: number`

**Returns:** `Map<string, Map<string, unknown>>` (TargetId -> Property -> Value)

### Easing Functions
`import * as Easing from '@Animatica/engine/animation/easing'`

- `linear(t)`
- `quad(t)` / `easeIn(t)`
- `easeOut(t)`
- `easeInOut(t)`
- `bounce(t)`
- `elastic(t)`
- `step(t)`

---

## Playback
`import { usePlayback } from '@Animatica/engine'`

### `usePlayback(options?)`
Hook that provides playback controls for the scene animation.

**Options:**
- `loop?: boolean`
- `speed?: number`

**Returns:**
- `play(): void`
- `pause(): void`
- `stop(): void`
- `seek(time: number): void`
- `toggle(): void`
- `setSpeed(speed: number): void`

---

## Importer
`import { ... } from '@Animatica/engine'`

### `validateScript(jsonString)`
Validates a raw JSON string against the ProjectState schema.

**Parameters:**
- `jsonString: string`

**Returns:** `ValidationResult` (`{ success: boolean, errors: string[], data?: ProjectState }`)

### `importScript(jsonString)`
Imports a scene script, throwing an error if validation fails.

**Parameters:**
- `jsonString: string`

**Returns:** `ProjectState`

---

## AI
`import { getAiPrompt } from '@Animatica/engine'`

### `getAiPrompt(userIdea, style)`
Generates a system prompt for an LLM to create a scene script.

**Parameters:**
- `userIdea: string`
- `style: PromptStyle` ('Noir', 'Comedy', 'Horror', etc.)

**Returns:** `string` (The full prompt)

---

## Config
`import { ... } from '@Animatica/engine'`

### `<FeatureFlagProvider />`
Context provider for feature flags.

**Props:**
- `initialFlags?: Partial<FeatureFlags>`

### `useFeatureFlag(key)`
Hook to check if a feature is enabled.

**Parameters:**
- `key: keyof FeatureFlags`

**Returns:** `boolean`
