# Animatica — Claude Context Document

> **Living document.** Updated continuously to maintain full project context.
> Last updated: 2026-02-22 20:35 EST

---

## 1. What is Animatica?

**The YouTube of Animation** — a web platform where anyone (especially a 16-year-old with zero coding skills) can create, animate, and publish 3D animated shorts. Users write a text script → AI generates a 3D scene → user tweaks in a visual editor → exports as video → publishes on the platform → earns through an asset marketplace with crypto monetization.

### Core Pipeline

```
Text Script → AI Parser → Scene JSON → Zod Validation → Zustand Store → R3F Renderer → Video Export
```

### Tech Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Engine**: TypeScript, Zod, Zustand + Immer, React Three Fiber
- **Editor**: React (planned, mostly empty now)
- **Platform**: Supabase (PostgreSQL + Auth + Storage)
- **Blockchain**: Hardhat (contracts package exists but empty)
- **Build**: Vite, vitest

---

## 2. Repository Structure

```
fredess/
├── packages/
│   ├── engine/        ← Core animation engine (25 files, 1141 LOC)
│   │   └── src/
│   │       ├── types/          # TypeScript interfaces (Actor, Timeline, Environment, ProjectState)
│   │       ├── schemas/        # Zod validation (actor.schema, scene.schema)
│   │       ├── store/          # Zustand + Immer scene store
│   │       ├── importer/       # JSON script importer with validation
│   │       ├── animation/      # Easing functions + keyframe interpolation
│   │       ├── scene/renderers # PrimitiveRenderer, LightRenderer, CameraRenderer (R3F)
│   │       ├── ai/            # Prompt templates for AI scene generation
│   │       └── __tests__/     # Benchmark tests
│   ├── editor/        ← UI editor (nearly empty, index.ts + design-tokens.css)
│   ├── contracts/     ← Solidity smart contracts (scaffolded, no real code)
│   └── platform/      ← Platform utilities (scaffolded, minimal)
├── apps/web/          ← Next.js web app (minimal)
├── docs/              ← 23 doc files (architecture, branding, roadmap, etc.)
├── reports/daily/     ← Night Reporter output
├── supabase/          ← Database migrations
└── .github/           ← CI/CD + issue templates
```

---

## 3. Engine Architecture (Core of the Project)

### Data Model (types/index.ts — 410 lines)

- **Actors**: `CharacterActor`, `PrimitiveActor`, `LightActor`, `CameraActor`, `SpeakerActor`
- **Timeline**: `AnimationTrack` → `Keyframe<T>` with `EasingType`, `CameraCut` events
- **Environment**: ambient light, sun, sky color, fog, weather
- **Project**: `ProjectState` = meta + environment + actors + timeline + library

### Validation (schemas/)

- `actor.schema.ts` — Zod schemas for each actor type with discriminated unions
- `scene.schema.ts` — Timeline, Environment, ProjectState schemas
- All schemas mirror TypeScript interfaces exactly

### State Management (store/sceneStore.ts — 136 lines)

- Zustand store with Immer middleware
- Actions: `addActor`, `removeActor`, `updateActor`, `setEnvironment`, `setTimeline`, `setPlayback`
- Selectors: `getActorById`, `getActiveActors`, `getCurrentTime`

### Importer (importer/scriptImporter.ts — 107 lines)

- `validateScript(json)` — parses, unwraps "project" wrapper, validates with Zod
- `importScript(json)` — validates and throws on failure
- `tryImportScript(json)` — validates without throwing
- 10MB size limit (security)

### Animation (animation/)

- `easing.ts` — linear, easeIn, easeOut, easeInOut, step
- `interpolate.ts` — keyframe interpolation with type detection (number, Vector3, Color, boolean step)
- `evaluateTracksAtTime()` — evaluates all animation tracks at a given time

### Scene Renderers (scene/renderers/)

- `PrimitiveRenderer.tsx` — renders box, sphere, cylinder, etc. with React Three Fiber
- `LightRenderer.tsx` — renders point, spot, directional lights
- `CameraRenderer.tsx` — renders perspective camera using @react-three/drei

### SceneManager (scene/SceneManager.tsx — NEW)

- Orchestrates all renderers based on Zustand store state
- Applies animation interpolation to actors each frame
- Resolves active camera from camera track timeline
- Renders environment (ambient light, sun, sky, fog)

### PlaybackController (playback/PlaybackController.ts — NEW)

- `usePlayback()` hook using requestAnimationFrame
- Controls: play(), pause(), stop(), seek(), toggle(), setSpeed()
- Frame-rate quantization, looping support, auto-pause at end

### AI (ai/promptTemplates.ts)

- `getAiPrompt(style)` — generates structured prompts for AI scene generation
- `PROMPT_STYLES` — preset styles (cinematic, cartoon, etc.)

---

## 4. Current State (Feb 22, 2026)

### What Works

- **Phase 1 Engine Core: 100% COMPLETE** (10/10 components)
- 73 tests passing, 0 failing
- Types, schemas, store, importer, animation engine all functional
- All scene renderers exist (Primitive, Light, Camera)
- SceneManager orchestrates everything
- PlaybackController drives animation playback
- CI pipeline working (triggers on main, uses pnpm)
- 23 documentation files covering architecture, branding, roadmap

### What's Missing

- **Editor is empty**: only `index.ts` with `export {}` and `design-tokens.css`
- **No web app**: apps/web is minimal scaffold
- **CharacterRenderer placeholder**: capsule placeholder implemented, needs full GLB support
- **SpeakerRenderer placeholder**: basic 3D audio implemented
- **All 9 conflicting PRs closed** — agents will create fresh ones

### Progress Tracking

- Phase 1 (Engine Core): 100% complete
- Phase 2-10: 0% (Characters, Editor, Export, AI, Platform, Marketplace, Crypto, Collab, 2D)

---

## 5. Jules Agents Evaluation

### What Works Well

- ✅ Documentation agents (Sprint Captain, Retrospective, Changelog) produce clean, useful docs
- ✅ PRs are well-structured with clear titles and descriptions
- ✅ Night Reporter generated a solid status report
- ✅ Agents follow coding standards (JSDoc, named exports, tests)

### What Doesn't Work

- ❌ Multiple agents modify same files → merge conflicts (9 conflicting PRs)
- ❌ No CI checks → agents push broken or conflicting code without warning
- ❌ PROGRESS.md is stale (says Light/Camera renderers are pending but they exist)
- ❌ Built-in Jules agents (Palette, Bolt, Sentinel) are duplicated 3x each
- ❌ Some agents can't access GitHub Issues API → incomplete reports

### Recommendations

1. Enable CI on `main` branch with pnpm
2. Set branch protection rules to prevent direct pushes
3. Reduce agent overlap — stagger them more carefully
4. Add JULES_GUIDE.md instructions about checking for existing PRs before creating new ones

---

## 6. Design System — "Retro Futurism 71"

- **Colors**: Green (#00FF66), White (#FFFFFF), Black (#000000)
- **Accent**: Lime (#B0FF00), Dark Green (#003322)
- **Fonts**: Space Grotesk (headings), Inter (body), JetBrains Mono (code)
- **Pattern**: 70s parallel stripes motif
- **CSS Variables**: defined in `packages/editor/src/styles/design-tokens.css`

---

## 7. Roadmap (from docs/ROADMAP.md)

| Phase | Duration | Focus |
|-------|----------|-------|
| 1 | Weeks 1-4 | Engine Core (types, schemas, renderers, store) |
| 2 | Weeks 5-6 | Characters (humanoid loading, animation) |
| 3 | Weeks 5-8 | Editor UI (timeline, property panel, viewport) |
| 4 | Weeks 9-10 | Export & Audio (video render, TTS) |
| 5 | Weeks 11-14 | AI Integration (script→scene, style presets) |
| 6 | Weeks 15-20 | Platform (auth, storage, social) |
| 7 | Weeks 21-24 | Asset Marketplace |
| 8 | Weeks 25-28 | Crypto Monetization |
| 9 | Weeks 29-32 | Collaboration |
| 10 | Weeks 33-40 | 2D Mode + Polish |

---

## 8. Key Files Reference

| File | Purpose |
|------|---------|
| `packages/engine/src/index.ts` | Public API exports |
| `packages/engine/src/types/index.ts` | All TypeScript interfaces |
| `packages/engine/src/schemas/actor.schema.ts` | Actor Zod schemas |
| `packages/engine/src/schemas/scene.schema.ts` | Scene/Project Zod schemas |
| `packages/engine/src/store/sceneStore.ts` | Zustand scene store |
| `packages/engine/src/importer/scriptImporter.ts` | JSON script importer |
| `packages/engine/src/animation/interpolate.ts` | Keyframe interpolation |
| `packages/engine/src/animation/easing.ts` | Easing functions |
| `docs/ARCHITECTURE.md` | Technical architecture |
| `docs/BRANDING.md` | Design system spec |
| `docs/ROADMAP.md` | Development roadmap |
| `docs/JULES_GUIDE.md` | Agent coding standards |
| `.github/workflows/ci.yml` | CI pipeline (BROKEN — targets master) |
