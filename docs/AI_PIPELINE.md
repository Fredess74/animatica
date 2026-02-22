# AI Pipeline

## Two-Phase Strategy

### Phase A: Manual Copy-Paste (MVP)

No API key required. No backend. Pure client-side.

```
User writes idea → Clicks "Copy AI Prompt" → Pastes into ChatGPT/Claude
→ Gets JSON back → Pastes into Script Console → Validate → Build Scene
```

**Implementation:**

- `aiPromptTemplate.ts` contains a static prompt string with:
  - Full JSON schema reference
  - All actor types, properties, animation states
  - Camera angle suggestions
  - Style presets (noir, comedy, horror, anime, etc.)
  - `[USER_IDEA_HERE]` placeholder
- `ScriptConsole.tsx` has:
  - "📋 Copy AI Prompt" button → copies prompt to clipboard
  - Textarea for pasting JSON result
  - "Validate" → runs Zod schema
  - "Build Scene" → calls `importScript()` → renders in 3D

### Phase B: Direct API Integration (v2)

Backend handles LLM calls. User never leaves the editor.

```
User types idea → Backend calls LLM → Streams JSON → Validates → Auto-renders
```

**Implementation:**

- `POST /api/generate-scene` (Next.js API route)
  - Request: `{ prompt: string, style?: string, duration?: number }`
  - Response: Streaming JSON
  - Backend stores API keys (never exposed to client)
- Frontend shows live streaming progress
- Auto-validates on complete
- One-click "Build Scene" after preview

---

## AI Capabilities (Current + Future)

### MVP (Phase A)

| Capability | Status | How |
|-----------|--------|-----|
| Scene layout generation | ✅ | LLM generates actor positions, cameras, lights |
| Character setup | ✅ | Animation states, clothing, expressions |
| Keyframe animation | ✅ | Walk paths, camera moves, expression changes |
| Environment | ✅ | Weather, fog, sky color, lighting mood |
| Camera work | ✅ | Cut sequence, tracking shots, close-ups |

### v2 (Phase B)

| Capability | Status | How |
|-----------|--------|-----|
| Style selection | 🔜 | User picks from genre buttons → adjusts prompt context |
| Dialogue generation | 🔜 | LLM writes character dialogue + TTS timing |
| AI scene editing | 🔜 | "Make the camera closer" → LLM patches existing JSON |
| Sound design | 🔜 | Auto-suggest music mood, SFX placement |
| Automatic pacing | 🔜 | LLM analyzes scene beats and adjusts timing |

### v3 (Future)

| Capability | Status | How |
|-----------|--------|-----|
| Voice generation | 🔮 | ElevenLabs / OpenAI TTS per character |
| Lip sync | 🔮 | Viseme mapping from audio → morph targets |
| Music generation | 🔮 | Suno/Udio API for original soundtrack |
| SFX generation | 🔮 | AI-generated sound effects |
| Full film from text | 🔮 | Multi-scene, multi-act generation pipeline |

---

## Style Selection System

Users choose style via clickable preset buttons (not typing):

| Style | Lighting | Weather | Camera | Mood Color |
|-------|---------|---------|--------|-----------|
| 🎬 **Noir** | Low key, harsh shadows | Rain | Low angles, Dutch tilts | `#1a1a2e` |
| 😂 **Comedy** | Bright, flat | Sunny | Wide shots, snappy cuts | `#fff4e6` |
| 👻 **Horror** | Dim, flickering | Fog/dust | POV, slow zoom | `#0a0a0a` |
| 🌸 **Anime** | Cel-shaded, bloom | Cherry blossoms | Dynamic, speed lines | `#ffb7c5` |
| 🤠 **Western** | Golden hour | Dust | Wide establishing, close-up eyes | `#c2956b` |
| 🚀 **Sci-Fi** | Neon, volumetric | None | Dolly, crane | `#00d4ff` |
| 💕 **Romance** | Soft, warm | Light snow | Two-shots, shallow DOF | `#ff6b9d` |
| ⚔️ **Action** | High contrast | Varies | Handheld, quick cuts | `#ff4444` |

These presets inject additional context into the LLM prompt, guiding lighting, weather, camera style, and color palette.

---

## AI Prompt Template Structure

```
SYSTEM: You are a professional film director creating scenes for the Animatica animation engine.

SCHEMA: [full JSON schema here]

ACTOR TYPES:
- character: humanoid with animation, clothing, facial expressions
- primitive: box, sphere, cylinder, etc.
- light: point, spot, directional
- camera: perspective camera with fov/near/far

ANIMATION STATES: idle, walk, run, wave, talk, dance, sit, jump

STYLE: [selected style preset context]

RULES:
1. Always include at least one camera
2. Timeline duration between 10-60 seconds
3. Use cinematic camera movements
4. Add environmental storytelling (lighting, weather, fog)
5. Vary shot types (wide, medium, close-up)

USER IDEA: [placeholder]

OUTPUT: Valid JSON matching the ProjectSchema. Nothing else.
```

---

## Synergy Between Manual and Integrated Modes

Both modes use the **same JSON schema and validation pipeline**. This means:

1. Scenes created manually can be refined via AI
2. AI-generated scenes can be hand-edited in the editor
3. Export/import is always compatible
4. The AI prompt template evolves as the schema evolves
5. Users can switch between modes at any point

This decoupled architecture means the AI layer is a **skin on top of the engine**, not baked into it.
