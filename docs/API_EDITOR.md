# @Animatica/editor API Reference

Public API documentation for the editor package.

## Layouts
`import { EditorLayout } from '@Animatica/editor'`

### `<EditorLayout />`
Main editor shell with a 3-panel layout:
- Left sidebar (AssetLibrary)
- Center viewport (R3F Canvas)
- Right sidebar (Properties)
- Bottom bar (Timeline)

Wraps content in `ToastProvider` and handles keyboard shortcuts.

**Props:**
- **`viewport: React.ReactNode`** - The R3F Canvas viewport to render in the center.

**Example:**
```tsx
<EditorLayout viewport={<Canvas><SceneManager /></Canvas>} />
```

---

## Panels
`import { ... } from '@Animatica/editor'`

### `<AssetLibrary />`
Categorized panel for adding actors to the scene. Categories include Primitives, Lights, Cameras, Characters, and Effects.

**Props:**
- **`onActorCreated?: (actorId: string) => void`** - Callback fired when an actor is created.

---

### `<PropertiesPanel />`
Shows and edits properties of the selected actor. Displays transform controls (position, rotation, scale) and type-specific properties (material, light settings, etc.).

**Props:**
- **`selectedActorId: string | null`** - The ID of the currently selected actor to edit.

---

### `<TimelinePanel />`
Playback controls and keyframe timeline. Includes a scrubber, play/pause/stop buttons, track list, and duration selector.

**Props:**
- **`selectedActorId: string | null`** - The ID of the selected actor to show tracks for.

---

## Modals
`import { ... } from '@Animatica/editor'`

### `<ScriptConsole />`
Modal for JSON scene script input and AI prompt generation. Features:
- Textarea for pasting/editing JSON scripts.
- "Validate" button to check against the schema.
- "Build Scene" button to import the script.
- "Copy AI Prompt" button to generate a prompt for an LLM.

**Props:**
- **`onClose: () => void`** - Callback to close the modal.

---

### `<ExportModal />`
Video export configuration and progress dialog. Allows selecting resolution (720p/1080p/4K), FPS (24/30/60), and format (MP4/WebM).

**Props:**
- **`onClose: () => void`** - Callback to close the modal.
