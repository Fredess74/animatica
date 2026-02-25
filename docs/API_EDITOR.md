# @Animatica/editor API Reference

Comprehensive API documentation for the editor package.

## Table of Contents

- [Layouts](#layouts)
- [Panels](#panels)
- [Modals](#modals)

---

## Layouts

Main structural components of the editor.

### `EditorLayout`

The main editor shell with a 3-panel layout: Left sidebar (AssetLibrary), center viewport (R3F Canvas), and right sidebar (Properties). Includes a bottom bar (Timeline) and top toolbar.

**Props:**

| Prop | Type | Description |
| :--- | :--- | :--- |
| `viewport` | `React.ReactNode` | The R3F Canvas component to render in the center area. |

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

**Features:**
- Wraps content in `ToastProvider`.
- Handles keyboard shortcuts (Play/Pause, Save, Undo, Delete, Escape).
- Manages modal visibility (`ScriptConsole`, `ExportModal`).

---

## Panels

Functional UI panels for editing the scene.

### `AssetLibrary`

A categorized list of assets (Primitives, Lights, Cameras, Characters) that can be added to the scene.

**Props:**

| Prop | Type | Description |
| :--- | :--- | :--- |
| `onActorCreated` | `(id: string) => void` | Callback fired when a new actor is added. Receives the new actor ID. |

**Categories:**
- **Primitives:** Box, Sphere, Cylinder, Cone, Torus, Plane.
- **Lights:** Point, Spot, Directional.
- **Cameras:** Perspective Camera.
- **Characters:** Humanoid (ReadyPlayerMe).

---

### `PropertiesPanel`

The inspector panel for viewing and editing properties of the currently selected actor.

**Props:**

| Prop | Type | Description |
| :--- | :--- | :--- |
| `selectedActorId` | `string \| null` | The ID of the currently selected actor to edit. |

**Features:**
- **General:** Name editing.
- **Transform:** Position, Rotation (degrees), Scale.
- **Material:** Color, Roughness, Metalness, Opacity, Wireframe (for Primitives).
- **Light:** Intensity, Color, Cast Shadow, Type.
- **Camera:** FOV, Near/Far planes.
- **Character:** Animation selection, Speed.

---

### `TimelinePanel`

Playback controls and keyframe timeline visualization.

**Props:**

| Prop | Type | Description |
| :--- | :--- | :--- |
| `selectedActorId` | `string \| null` | The ID of the currently selected actor (to highlight its track). |

**Features:**
- **Transport:** Play, Pause, Stop, Add Keyframe.
- **Scrubber:** Draggable timeline playhead.
- **Duration:** Selectable scene duration (5s - 60s).
- **Tracks:** Visualization of keyframes (diamonds) for the selected actor.

---

## Modals

Overlay dialogs for specific tasks.

### `ScriptConsole`

A modal for inputting, validating, and building scenes from JSON scripts. Also generates AI prompts.

**Props:**

| Prop | Type | Description |
| :--- | :--- | :--- |
| `onClose` | `() => void` | Callback to close the modal. |

**Features:**
- **JSON Editor:** Textarea with syntax highlighting (basic).
- **Validation:** Real-time validation against `ProjectState` schema.
- **AI Prompt:** "Copy AI Prompt" button to generate LLM prompts.
- **Build:** "Build Scene" button to import the validated script.

---

### `ExportModal`

Video export configuration dialog.

**Props:**

| Prop | Type | Description |
| :--- | :--- | :--- |
| `onClose` | `() => void` | Callback to close the modal. |

**Features:**
- **Resolution:** 720p, 1080p, 4K.
- **FPS:** 24, 30, 60.
- **Format:** MP4, WebM.
- **Progress:** Visual progress bar during export simulation.
