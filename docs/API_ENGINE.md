# @Animatica/engine API Reference

The core engine for the Animatica platform. Handles 3D rendering, animation state, and scene management using React Three Fiber and Zustand.

## Modules

### Types (`@animatica/engine/types`)

Core TypeScript definitions for the project.

- **`Actor`**: Union of all actor types (`CharacterActor`, `PrimitiveActor`, `LightActor`, `CameraActor`, `SpeakerActor`).
- **`ProjectState`**: The complete state of a project including meta, environment, actors, and timeline.
- **`Timeline`**: Animation configuration including duration, camera track, and animation tracks.
- **`Transform`**: Position, rotation, and scale (`Vector3`).
- **`Vector3`**: `[number, number, number]` tuple.

### Store (`@animatica/engine/store`)

State management using Zustand + Immer + Zundo.

#### `useSceneStore`
The main hook to access scene state.
```tsx
const { actors, addActor, updateActor } = useSceneStore()
```

#### Selectors
- **`getActorById(id)`**: Returns a specific actor.
- **`getActiveActors(state)`**: Returns all visible actors.
- **`getCurrentTime(state)`**: Returns the current playback time in seconds.
- **`useSelectedActor()`**: Hook to get the currently selected actor.

### Scene (`@animatica/engine/scene`)

React components for rendering the 3D scene.

#### `SceneManager`
Orchestrates the rendering of all actors based on the store state.
```tsx
<SceneManager selectedActorId={id} showHelpers={true} />
```

#### Renderers
- **`PrimitiveRenderer`**: Renders basic shapes (box, sphere, etc.).
- **`LightRenderer`**: Renders lights (point, spot, directional) and gizmos.
- **`CameraRenderer`**: Renders cameras and frustum helpers.
- **`CharacterRenderer`**: Renders humanoid characters.

### Playback (`@animatica/engine/playback`)

Animation loop control.

#### `usePlayback(options)`
Hook to control the animation timeline.
```tsx
const { play, pause, seek, setSpeed } = usePlayback({ loop: true });
```
- **`play()`**: Start playback.
- **`pause()`**: Pause playback.
- **`seek(time)`**: Jump to a specific time.

### Animation (`@animatica/engine/animation`)

Utilities for keyframe interpolation and easing.

- **`interpolateKeyframes(keyframes, time)`**: Interpolates values (number, vector, color) at a given time.
- **`Easing`**: Collection of easing functions (`linear`, `quad`, `bounce`, etc.).

### Importer (`@animatica/engine/importer`)

Utilities for loading and validating scene scripts (JSON).

- **`importScript(json)`**: Validates and returns a `ProjectState` object. Throws on error.
- **`validateScript(json)`**: Returns a validation result object with errors list.
- **`tryImportScript(json)`**: Safe wrapper returning `{ ok: boolean, data? }`.

### AI (`@animatica/engine/ai`)

Prompt engineering utilities.

- **`getAiPrompt(userIdea, style)`**: Generates a system prompt for an LLM to create a scene script.
- **`PROMPT_STYLES`**: List of available styles (Noir, Anime, Cyberpunk, etc.).

### Schemas (`@animatica/engine/schemas`)

Zod schemas for runtime validation.

- **`ProjectStateSchema`**: Validates a full project JSON.
- **`ActorSchema`**: Validates any actor object.
