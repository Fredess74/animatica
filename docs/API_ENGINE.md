# @Animatica/engine API Reference

Comprehensive API documentation for the core engine package.

## Table of Contents

- [Store](#store)
- [Scene](#scene)
- [Animation](#animation)
- [Importer](#importer)
- [AI](#ai)
- [Config](#config)

---

## Store

State management for the scene, including actors, timeline, environment, and playback.

### `useSceneStore`

Zustand store hook for accessing and modifying the scene state.

**Signature:**
```typescript
const useSceneStore = create<SceneStoreState>()
```

**State Properties:**
- `actors`: Array of all actors in the scene.
- `environment`: Environment settings (light, sky, fog).
- `timeline`: Timeline configuration (duration, tracks).
- `playback`: Playback state (currentTime, isPlaying).
- `selectedActorId`: ID of the currently selected actor.

**Actions:**
- `addActor(actor: Actor): void` - Adds a new actor.
- `removeActor(actorId: string): void` - Removes an actor by ID.
- `updateActor(actorId: string, updates: Partial<Actor>): void` - Updates an actor.
- `setEnvironment(env: Partial<Environment>): void` - Updates environment settings.
- `setTimeline(timeline: Partial<Timeline>): void` - Updates timeline settings.
- `setPlayback(playback: Partial<PlaybackState>): void` - Updates playback state.
- `setSelectedActor(id: string | null): void` - Sets the selected actor.

**Example:**
```tsx
const { actors, addActor, undo, redo } = useSceneStore()
```

### Selectors

Helper functions to select specific parts of the state.

#### `getActorById(id: string)`
Selector to get an actor by its ID.
- **Returns:** `Actor | undefined`

#### `getActiveActors(state)`
Selector to get all currently visible actors.
- **Returns:** `Actor[]`

#### `getCurrentTime(state)`
Selector to get the current playback time.
- **Returns:** `number`

#### `useActorById(id: string)`
Hook to select a specific actor by ID.
- **Returns:** `Actor | undefined`

#### `useSelectedActor()`
Hook to get the currently selected actor.
- **Returns:** `Actor | undefined`

---

## Scene

Components for rendering the 3D scene.

### `SceneManager`

The main scene orchestrator component. Reads actors from the store and renders them using appropriate sub-renderers.

**Props:**
- `selectedActorId?: string` - ID of the currently selected actor.
- `onActorSelect?: (id: string) => void` - Callback when an actor is clicked.
- `showHelpers?: boolean` - Whether to show debug helpers (gizmos).

**Example:**
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

## Animation

Utilities for keyframe interpolation and easing.

### `interpolateKeyframes(keyframes, time)`

Interpolates a value at a given time from a sorted array of keyframes. Supports numbers, Vector3s, and colors.

**Signature:**
```typescript
function interpolateKeyframes<T>(keyframes: Keyframe<T>[], time: number): T | undefined
```

**Parameters:**
- `keyframes`: Array of keyframes (sorted by time).
- `time`: Target time in seconds.

**Returns:** Interpolated value.

### `evaluateTracksAtTime(tracks, time)`

Evaluates all animation tracks at a given time.

**Signature:**
```typescript
function evaluateTracksAtTime(
  tracks: AnimationTrack[],
  time: number
): Map<string, Map<string, unknown>>
```

**Returns:** Map of `TargetId -> Property -> Value`.

### Easing Functions

Available easing functions in `@animatica/engine/animation/easing`:

- `linear(t)`
- `quad(t)`, `easeIn(t)`
- `cubic(t)`
- `easeOut(t)`
- `easeInOut(t)`
- `bounce(t)`
- `elastic(t)`
- `step(t)`

---

## Importer

JSON script validation and import utilities.

### `validateScript(jsonString)`

Validates a raw JSON string against the project schema.

**Signature:**
```typescript
function validateScript(jsonString: string): ValidationResult
```

**Returns:** Object with `success`, `errors`, and parsed `data`.

### `importScript(jsonString)`

Imports a scene script, throwing an error if validation fails.

**Signature:**
```typescript
function importScript(jsonString: string): ProjectState
```

**Throws:** Error with detailed validation messages.

### `tryImportScript(jsonString)`

Safe version of importScript that returns a result object instead of throwing.

**Signature:**
```typescript
function tryImportScript(jsonString: string):
  { ok: true; data: ProjectState } | { ok: false; errors: string[] }
```

---

## AI

AI prompt generation utilities.

### `getAiPrompt(userIdea, style)`

Generates a structured system prompt for an LLM to create a scene script.

**Signature:**
```typescript
function getAiPrompt(userIdea: string, style: PromptStyle): string
```

**Parameters:**
- `userIdea`: Description of the scene.
- `style`: Cinematic style (e.g., 'Noir', 'Cyberpunk').

**Styles:**
`Noir`, `Comedy`, `Horror`, `Anime`, `Cyberpunk`, `Fantasy`, `Documentary`, `Musical`

---

## Config

Feature flag management.

### `FeatureFlagProvider`

Context provider for feature flags.

**Props:**
- `children`: React nodes.
- `initialFlags?`: Optional overrides for default flags.

### `useFeatureFlag(key)`

Hook to check if a feature is enabled.

**Signature:**
```typescript
function useFeatureFlag(key: keyof FeatureFlags): boolean
```

**Flags:**
- `characters`
- `export`
- `ai_prompts`
- `multiplayer`
- `cloud_sync`
