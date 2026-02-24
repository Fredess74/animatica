# @Animatica/editor API Reference

This document provides a comprehensive reference for the `@Animatica/editor` package, generated from JSDoc comments.

## Table of Contents

- [Layouts](#layouts)
- [Panels](#panels)
- [Modals](#modals)

---

## Layouts

Import from `@Animatica/editor/layouts`.

### `EditorLayout`
Main editor shell with a 3-panel layout.
- **Left Sidebar**: AssetLibrary (250px)
- **Center**: Viewport (R3F Canvas)
- **Right Sidebar**: PropertiesPanel (300px)
- **Bottom**: TimelinePanel (200px)

Wraps content in `ToastProvider` and handles global keyboard shortcuts.

**Props:**
- **`viewport`**: `React.ReactNode` — The R3F Canvas component to render in the center area.

**Keyboard Shortcuts:**
- `Space`: Play/Pause
- `Cmd/Ctrl + S`: Save
- `Cmd/Ctrl + Z`: Undo (placeholder)
- `Delete / Backspace`: Delete selected actor
- `Escape`: Clear selection / Close modals

**Example:**
```tsx
<EditorLayout
  viewport={
    <Canvas>
      <SceneManager />
    </Canvas>
  }
/>
```

---

## Panels

Import from `@Animatica/editor/panels`.

### `AssetLibrary`
Categorized panel for adding actors to the scene.
Categories: Primitives, Lights, Cameras, Characters, Effects.

**Props:**
- **`onActorCreated`**: `(actorId: string) => void` (optional) — Callback fired when an actor is added.

### `PropertiesPanel`
Shows and edits properties of the currently selected actor.
Displays transform (position, rotation, scale) and type-specific properties (material, light intensity, camera FOV, etc.).

**Props:**
- **`selectedActorId`**: `string | null` — ID of the actor to edit.

### `TimelinePanel`
Playback controls and keyframe timeline.
Includes scrubber, play/pause/stop buttons, duration selector, and track list.

**Props:**
- **`selectedActorId`**: `string | null` — ID of the actor to show specific tracks for.

---

## Modals

Import from `@Animatica/editor/modals`.

### `ScriptConsole`
Modal for JSON scene script input and AI prompt generation.
Features:
- Textarea for pasting/editing JSON scripts.
- **Validate**: Checks JSON against the Zod schema.
- **Build Scene**: Imports the script into the store.
- **Copy AI Prompt**: Generates a prompt for LLMs to create scenes.

**Props:**
- **`onClose`**: `() => void` — Callback to close the modal.

### `ExportModal`
Video export configuration and progress dialog.

**Features:**
- **Resolution**: 720p, 1080p, 4K.
- **Frame Rate**: 24, 30, 60 FPS.
- **Format**: MP4, WebM.
- **Progress Bar**: Shows export status.

**Props:**
- **`onClose`**: `() => void` — Callback to close the modal.
