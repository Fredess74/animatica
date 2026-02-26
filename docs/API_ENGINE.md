# @Animatica/engine API Reference

The `@Animatica/engine` package is the core of the Animatica platform. It provides the scene graph, animation system, rendering components, and state management logic.

## Table of Contents

- [Overview](#overview)
- [State Management](#state-management)
- [Playback Control](#playback-control)
- [Scene Rendering](#scene-rendering)
- [Data Models](#data-models)
- [Utilities](#utilities)

---

## Overview

The engine is built on top of [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) and [Zustand](https://github.com/pmndrs/zustand). It uses a centralized store to manage the scene state, which is then rendered declaratively by React components.

### Installation

```bash
pnpm add @animatica/engine
```

### Basic Usage

```tsx
import { Canvas } from '@react-three/fiber';
import { SceneManager, useSceneStore } from '@animatica/engine';

function App() {
  return (
    <Canvas>
      <SceneManager />
    </Canvas>
  );
}
```

---

## State Management

The engine uses a single Zustand store `useSceneStore` to manage all application state.

### `useSceneStore`

The main hook to access the store. It is sliced into `actors`, `timeline`, `environment`, `playback`, and `meta`.

```tsx
import { useSceneStore } from '@animatica/engine';

// Select specific state
const actors = useSceneStore((state) => state.actors);
const isPlaying = useSceneStore((state) => state.playback.isPlaying);

// Access actions
const addActor = useSceneStore((state) => state.addActor);
const setPlayback = useSceneStore((state) => state.setPlayback);
```

### Selectors & Hooks

Optimized hooks for common data access:

- `useActorById(id: string)`: Returns a specific actor.
- `useActorIds()`: Returns a list of all actor IDs (stable reference).
- `useActiveActors()`: Returns only visible actors.
- `useCurrentTime()`: Returns the current playback time.
- `useIsPlaying()`: Returns the playback status.
- `useSelectedActorId()`: Returns the ID of the selected actor.
- `useSelectedActor()`: Returns the selected actor object.
- `useActorsByType(type)`: Returns actors of a specific type (e.g., 'character').

---

## Playback Control

Animation playback is handled by the `usePlayback` hook, which manages the `requestAnimationFrame` loop and synchronizes the store time.

### `usePlayback()`

```tsx
import { usePlayback } from '@animatica/engine';

function Controls() {
  const { play, pause, toggle, seek, setSpeed } = usePlayback();

  return (
    <div>
      <button onClick={toggle}>Play/Pause</button>
      <input
        type="range"
        onChange={(e) => seek(parseFloat(e.target.value))}
      />
    </div>
  );
}
```

**Returns:** `PlaybackControls` object:
- `play()`: Start playback.
- `pause()`: Pause playback.
- `stop()`: Stop and reset to time 0.
- `seek(time: number)`: Jump to a specific time.
- `toggle()`: Toggle play/pause.
- `setSpeed(speed: number)`: Set playback speed (0.1x to 10x).
- `setLoopMode(mode: 'none' | 'loop' | 'pingpong')`: Set looping behavior.
- `nextFrame()`: Advance one frame.
- `prevFrame()`: Go back one frame.

---

## Scene Rendering

### `<SceneManager />`

The main component that renders the 3D scene. It must be placed inside a R3F `<Canvas>`.

**Props:**
- `selectedActorId?: string`: ID of the actor to highlight/select.
- `onActorSelect?: (id: string) => void`: Callback when an actor is clicked.
- `showHelpers?: boolean`: Whether to show debug helpers (lights, cameras).

### Renderers

Individual renderers for specific actor types (used internally by SceneManager):
- `PrimitiveRenderer`: Renders basic shapes (box, sphere, etc.).
- `CharacterRenderer`: Renders 3D characters (GLB) with animations.
- `LightRenderer`: Renders lights (point, spot, directional).
- `CameraRenderer`: Renders camera helpers.

---

## Data Models

Core interfaces defined in `types`.

### `ProjectState`

The root state object.

```typescript
interface ProjectState {
  meta: ProjectMeta;
  environment: Environment;
  actors: Actor[];
  timeline: Timeline;
  library: { clips: unknown[] };
}
```

### `Actor`

Base interface for scene objects.

```typescript
type Actor = CharacterActor | PrimitiveActor | LightActor | CameraActor | SpeakerActor;

interface BaseActor {
  id: string;
  name: string;
  transform: { position: Vector3, rotation: Vector3, scale: Vector3 };
  visible: boolean;
}
```

### `Timeline`

Animation data structure.

```typescript
interface Timeline {
  duration: number;
  cameraTrack: CameraCut[];
  animationTracks: AnimationTrack[];
  markers: Marker[];
}
```

### `PlaybackState`

Runtime playback configuration.

```typescript
interface PlaybackState {
  currentTime: number;
  isPlaying: boolean;
  frameRate: number;
  speed: number;
  direction: 1 | -1;
  loopMode: 'none' | 'loop' | 'pingpong';
}
```

---

## Utilities

### Importer

Import and validate scene scripts (JSON).

```typescript
import { importScript, validateScript } from '@animatica/engine';

const project = importScript(jsonString); // Throws if invalid
const result = validateScript(jsonString); // Returns { success, data, errors }
```

### Animation

Low-level interpolation functions.

```typescript
import { interpolateKeyframes, evaluateTracksAtTime } from '@animatica/engine';

const value = interpolateKeyframes(keyframes, time);
```

### AI

Generate structured prompts for LLMs.

```typescript
import { getAiPrompt } from '@animatica/engine';

const prompt = getAiPrompt("A cowboy duel at noon", "Western");
```

### Feature Flags

Manage feature toggles.

```tsx
import { FeatureFlagProvider, useFeatureFlag } from '@animatica/engine';

// Wrap app
<FeatureFlagProvider>
  <App />
</FeatureFlagProvider>

// Use in component
const showExport = useFeatureFlag('export');
```
