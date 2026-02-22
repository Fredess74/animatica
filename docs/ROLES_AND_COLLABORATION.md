# Roles & Collaboration

## Creator Roles

Every film on Animatica can have multiple creators with different roles. Roles determine what parts of the editor are emphasized.

### Available Roles

| Role | Icon | Responsibilities | Editor Mode |
|------|------|-----------------|-------------|
| **Director** | 🎬 | Overall vision, camera, scene flow | Full access, camera emphasis |
| **Writer** | ✍️ | Script, dialogue, story structure | Script console, text tools |
| **Animator** | 🎭 | Character movement, keyframes, timing | Timeline, properties panel |
| **Producer** | 📊 | Publishing, monetization, team management | Dashboard, team panel |
| **Sound Designer** | 🎵 | Music, SFX, voice acting | Audio panel, timeline |
| **Asset Creator** | 🏗️ | 3D/2D model creation, environment design | Asset tools, marketplace |

### Role-Based Editor Modes

When a user selects a role, the editor UI adapts:

**Director Mode** (🎬)

- Camera controls are prominent
- Scene overview panel (bird's eye view of all actors)
- Shot list / storyboard sidebar
- One-click genre presets

**Writer Mode** (✍️)

- Script console is full-width
- Dialogue editor for characters
- AI prompt area is front and center
- Scene breakdown view (text-based, not 3D)

**Animator Mode** (🎭)

- Timeline takes up 40% of screen
- Properties panel shows all keyframe curves
- Onion skinning (ghost of previous/next frames)
- Per-bone control panel

**Producer Mode** (📊)

- Analytics dashboard (views, donations, retention)
- Team management (invite, assign roles, set revenue splits)
- Publishing settings (visibility, series, metadata)
- Revenue split configuration

**Sound Designer Mode** (🎵)

- Audio timeline (separate from animation timeline)
- Waveform display
- TTS panel for character voices
- Music/SFX browser

---

## Collaboration Model

### Real-Time Sync (Yjs/CRDT)

Multiple users can edit the same project simultaneously. Changes are synced in real-time using Yjs (a CRDT library).

```
User A (Director)          y-websocket server          User B (Animator)
      │                          │                           │
      ├── move camera ──────────►│──── broadcast ───────────►│ sees camera move
      │                          │                           │
      │◄──── broadcast ──────────│◄── add keyframe ──────────┤ adds keyframe
      │ sees new keyframe        │                           │
```

### What Gets Synced

| Data | Sync Strategy |
|------|--------------|
| Actor list (add/remove/reorder) | Yjs Y.Array |
| Actor properties (transform, material) | Yjs Y.Map |
| Timeline (keyframes, tracks) | Yjs Y.Array of Y.Maps |
| Environment settings | Yjs Y.Map |
| Script / dialogue text | Yjs Y.Text |
| Chat messages | Yjs Y.Array |

### Conflict Resolution

- **CRDT guarantees** — no conflicts on concurrent edits to different properties
- **Same property** — last-writer-wins with visual indicator ("User A also edited this")
- **Undo/redo** — per-user undo stack (you only undo your own changes)

### Presence Indicators

- Colored cursors/selections per user
- Avatar badges on selected actors ("User A is editing this character")
- Role badges next to usernames
- "Who's here" panel with online status

---

## Project Ownership

| Concept | Rule |
|---------|------|
| **Creator** | The user who initiated the project |
| **Collaborator** | Invited user with assigned role |
| **Revenue split** | Set by creator (e.g., Director 50%, Writer 30%, Animator 20%) |
| **Transfer ownership** | Creator can transfer to another collaborator |
| **Leave project** | Collaborator can leave; their revenue share is redistributed |
| **Fork** | Anyone can fork a public project (new project, no revenue inheritance) |

---

## Content Organization

### Video Types

| Type | Description |
|------|------------|
| **Short** | Single scene, 10 sec – 5 min |
| **Film** | Multi-scene, 5 – 60+ min |
| **Episode** | Part of a series |
| **Series** | Ordered collection of episodes |
| **Clip** | Excerpt from a longer work |

### Series Structure

```
Series: "The Robot Chronicles"
├── Season 1
│   ├── Episode 1: "Awakening" (5 min)
│   ├── Episode 2: "First Steps" (7 min)
│   └── Episode 3: "The City" (10 min)
└── Season 2
    ├── Episode 1: "New World" (8 min)
    └── ...
```

### Licensing

Content is owned by the creators. Platform gets a non-exclusive license to host and distribute. Creators can:

- Publish under Creative Commons (CC-BY, CC-BY-SA, CC-BY-NC)
- Keep full copyright (default)
- Allow/disallow forks
- Allow/disallow use in other creators' projects

### Content Ratings

| Rating | Age | Content |
|--------|-----|---------|
| G | All ages | No violence, no language |
| PG | 10+ | Mild cartoon violence |
| T | 13+ | Moderate violence, mild language |
| M | 17+ | Strong violence, strong language |

Creator self-rates their content. Community can flag incorrectly rated content.
