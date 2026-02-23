# Jules Guide — AI Agent Instructions

> **You are Jules, Google's AI coding agent.** This document tells you everything you need to know about the Animatica project, how to write code for it, and in what order.

---

## Project Summary

Animatica is a web-based animation platform. Users write text → AI generates animated scenes → users publish and earn money via crypto donations.

**Your job:** Build the codebase module by module, following the task sequence below. Each task = one PR. Each PR touches one package only.

---

## Coding Standards (MANDATORY)

### TypeScript Rules

1. **`strict: true`** — no implicit any, no unused variables
2. **Named exports only** — never use `export default`
3. **Max 200 lines per file** — split into smaller modules if longer
4. **No `any` type** — use `unknown` + type narrowing if needed
5. **Interfaces over types** — use `interface` for object shapes, `type` for unions
6. **Immutable state** — use Zustand with `immer` middleware, never mutate directly
7. **Zod for all JSON** — never use raw `JSON.parse` without Zod validation

### React Rules

1. **Error boundaries** — wrap every Three.js Canvas component in ErrorBoundary
2. **Null-check 3D assets** — guard every `useGLTF`, `useAnimations`, `useTexture` with null checks
3. **Suspense** — wrap async components in `<Suspense fallback={<Loading />}>`
4. **No inline styles** — use Tailwind CSS classes only
5. **Semantic HTML** — proper heading hierarchy, aria labels

### File Organization

1. **Co-locate tests** — `MyModule.ts` → `MyModule.test.ts` in same directory
2. **Index re-exports** — each directory has `index.ts` that re-exports public API
3. **Imports order** — externals → package imports → relative imports → types

### Git & Automation Rules

1. **Task Triggers** — You will be triggered by GitHub Issues labeled `jules-task`. Read the issue body fully.
2. **Branch naming** — `feat/task-[issue-number]-description` (e.g., `feat/task-42-types`)
3. **Commit messages** — `feat(engine): add keyframe interpolation engine (#42)`
4. **One package per PR** — NEVER edit files in multiple packages
5. **Max 5 files per PR** — keep PRs small and reviewable
6. **Tests required** — every PR must contain at least one test file
7. **CI Self-Healing** — If the CI pipeline fails (`pnpm run typecheck` or `test`), the GitHub Action will comment on your PR. You MUST read the error logs, fix the code, and push a new commit to the same branch. Do not wait for human intervention.
8. **Check for existing PRs** — Before creating a new PR, check if another agent already has an open PR touching the same files. If so, wait or pick a different task.
9. **Issue Tracking Workaround** — You may not have direct GitHub Issues API access. If you cannot read/create GitHub Issues, use `docs/BACKLOG.md` as your local issue tracker. Reference GitHub Issue numbers (e.g., `#14`) in your commit messages and PR descriptions. The human maintainer will sync `BACKLOG.md` with GitHub Issues periodically.
10. **Package Manager** — This project uses `pnpm`, NOT `npm`. Always use `pnpm install`, `pnpm run test`, `pnpm run typecheck`, etc.

---

## Task Sequence

Execute these tasks **in order**. Each task is one PR. Do not skip ahead.

### Batch 1: Engine Foundation (no dependencies)

These tasks have NO dependencies and CAN run in parallel.

#### Task 1: Types & Interfaces

- **Package:** `packages/engine`
- **Files:** `src/types/index.ts`
- **What:** Define ALL TypeScript interfaces for the project
- **Interfaces:** `Actor`, `CharacterActor`, `PrimitiveActor`, `LightActor`, `CameraActor`, `Transform`, `Vector3`, `Keyframe`, `AnimationTrack`, `CameraCut`, `Timeline`, `Environment`, `Weather`, `MorphTargets`, `BodyPose`, `ClothingItem`, `ClothingSlots`, `ProjectState`, `ProjectMeta`, `ValidationResult`
- **Test:** TypeScript compilation passes (`tsc --noEmit`)
- **See:** [DATA_MODELS.md](DATA_MODELS.md) for exact definitions

#### Task 2: Zod Schemas

- **Package:** `packages/engine`
- **Files:** `src/importer/schemas/common.ts`, `actor.ts`, `character.ts`, `environment.ts`, `timeline.ts`, `project.ts`
- **What:** Zod schemas matching every TypeScript interface
- **Test:** Unit tests — validate demo JSON files, reject malformed JSON
- **Reference JSON:** `examples/cowboy_story.json`, `examples/demo_android_scene.json`

#### Task 3: Easing Functions

- **Package:** `packages/engine`
- **Files:** `src/animation/EasingFunctions.ts`
- **What:** `linear`, `easeIn`, `easeOut`, `easeInOut`, `step` — pure functions `(t: number) => number`
- **Test:** Unit tests — verify curve values at t=0, 0.25, 0.5, 0.75, 1.0

#### Task 4: Keyframe Engine

- **Package:** `packages/engine`
- **Files:** `src/animation/KeyframeEngine.ts`
- **Depends on:** Task 3 (easing functions)
- **What:** Given a list of keyframes and a time, interpolate the value. Handle `number`, `[x,y,z]`, and `string` (step interpolation for animation states)
- **Test:** Unit tests — various time positions, edge cases (before first, after last)

#### Task 5: Zustand Store

- **Package:** `packages/engine`
- **Files:** `src/store/useEngineStore.ts`, `src/store/types.ts`, `src/store/slices/actorsSlice.ts`, `timelineSlice.ts`, `environmentSlice.ts`, `playbackSlice.ts`
- **Depends on:** Task 1 (types)
- **What:** Full store with all slices. Use `immer` middleware.
- **Test:** Unit tests — addActor, removeActor, addKeyframe, play/pause/seek, loadProject

---

### Batch 2: Rendering (depends on Batch 1)

#### Task 6: Primitive Renderer

- **Package:** `packages/engine`
- **Files:** `src/scene/renderers/PrimitiveRenderer.tsx`
- **What:** R3F component. Renders box, sphere, cylinder, plane, cone, torus with MeshStandardMaterial
- **Props:** `actor: PrimitiveActor`, `isSelected: boolean`
- **Test:** Renders without crashing, correct geometry type per shape

#### Task 7: Light Renderer

- **Package:** `packages/engine`
- **Files:** `src/scene/renderers/LightRenderer.tsx`
- **What:** R3F component. Renders PointLight, SpotLight, DirectionalLight + a visible helper gizmo in editor mode
- **Props:** `actor: LightActor`
- **Test:** Renders without crashing

#### Task 8: Camera Renderer

- **Package:** `packages/engine`
- **Files:** `src/scene/renderers/CameraRenderer.tsx`
- **What:** R3F component. Renders a camera helper (frustum wireframe) in editor view. Manages PerspectiveCamera for "rec view."
- **Props:** `actor: CameraActor`, `isActive: boolean`
- **Test:** Renders without crashing

#### Task 9: Scene Manager

- **Package:** `packages/engine`
- **Files:** `src/scene/SceneManager.tsx`, `src/scene/SceneObject.tsx`
- **What:** Reads actors from store, dispatches each to the correct renderer. Handles ambientLight, directional sun, fog, grid.
- **Test:** Integration — add actors to store → SceneManager renders them

#### Task 10: Playback Controller

- **Package:** `packages/engine`
- **Files:** `src/animation/PlaybackController.tsx`
- **What:** R3F `useFrame` hook. On each frame: advance `currentTime`, apply Keyframe Engine to all tracks, update actors in store.
- **Test:** Play → time advances. Pause → time stops. Seek → time jumps. Actors interpolate.

---

### Batch 3: Characters (depends on Batch 2)

#### Task 11: Humanoid Base

- **Files:** `src/characters/Humanoid.tsx`
- **What:** Load a ReadyPlayerMe GLB. Display idle animation. Handle missing model gracefully.
- **Test:** Model loads without crash. Fallback renders if load fails.

#### Task 12: Bone Controller

- **Files:** `src/characters/BoneController.ts`
- **What:** Map `bodyPose` object to skeleton bone rotations: head, spine, leftArm, rightArm, leftLeg, rightLeg.

#### Task 13: Morph Targets

- **Files:** `src/characters/MorphTargets.ts`
- **What:** Apply morph target influences from `morphTargets` object to the mesh.

#### Task 14: Clothing System

- **Files:** `src/characters/ClothingSystem.ts`
- **What:** Procedural clothing using primitive meshes attached to bone positions. Head/torso/arms/legs regions, color customization.

---

### Batch 4: Editor UI (depends on Batch 2)

#### Task 15: Editor Layout

- **Package:** `packages/editor`
- **Files:** `src/layouts/EditorLayout.tsx`, `src/App.tsx`, `src/main.tsx`, `src/index.css`
- **What:** 3-panel layout: left sidebar (250px), center viewport (flex), right sidebar (300px), bottom timeline (200px). Dark theme.

#### Task 16: Asset Library

- **Files:** `src/panels/AssetLibrary.tsx`
- **What:** Categorized list: Characters, Props, Lights, Cameras, Effects. Click → create actor in store.

#### Task 17: Properties Panel

- **Files:** `src/panels/PropertiesPanel.tsx`
- **What:** When actor selected → show transform (pos/rot/scale sliders), material properties, character-specific controls (animation, body pose, morph targets, clothing). When nothing selected → show environment controls.

#### Task 18: Timeline Panel

- **Files:** `src/panels/TimelinePanel.tsx`
- **What:** Playhead scrubber, play/pause/stop buttons, actor track list, keyframe diamonds, add/delete keyframe buttons. Duration selector.

#### Task 19: Script Console

- **Files:** `src/modals/ScriptConsole.tsx`
- **What:** Modal with textarea for JSON input. Buttons: Validate, Build Scene, Copy AI Prompt. Shows validation errors inline. Uses `getAiPrompt()` from engine.

#### Task 20: Export Modal

- **Files:** `src/modals/ExportModal.tsx`
- **What:** Resolution selector (1080p/4K), FPS (24/30/60), format (MP4). Start/cancel export. Progress bar.

---

### Batch 5: Integration (depends on Batch 3 + 4)

#### Task 21: Script Importer + AI Prompt Template

- **Package:** `packages/engine`
- **Files:** `src/importer/scriptImporter.ts`, `src/importer/aiPromptTemplate.ts`
- **What:** `importScript(json)` → validates with Zod → creates actors + timeline in store. `getAiPrompt()` returns the full prompt string with JSON schema for LLM.

#### Task 22: Video Exporter

- **Files:** `src/export/VideoExporter.tsx`
- **What:** Use WebCodecs API (or fallback to MediaRecorder) to capture canvas frames → encode MP4. Fire progress events.

#### Task 23: Audio Engine

- **Files:** `src/audio/AudioEngine.tsx`
- **What:** Tone.js-based. Spatial audio from SpeakerActors. Sync with playback time.

#### Task 24: Full App Assembly

- **Package:** `apps/web`
- **Files:** `app/layout.tsx`, `app/page.tsx`, `app/create/page.tsx`
- **What:** Next.js app. Landing page + /create route with full editor. Import engine + editor packages.
- **Test:** E2E — open app, add actor, play animation, export video.

---

### Batch 6+: Future Tasks

See [ROADMAP.md](ROADMAP.md) for tasks beyond the core editor: platform, marketplace, collaboration, smart contracts.

---

## How to Write a PR

1. Read the task description above
2. Check what dependencies exist (files that must exist already)
3. Create branch: `feat/batch-N-task-name`
4. Write the code following all coding standards
5. Write tests (co-located in same directory)
6. Ensure `pnpm run typecheck` passes
7. Ensure `pnpm run test` passes
8. PR title: `feat(engine): task description`
9. PR body: reference this guide's task number

---

## Common Pitfalls to Avoid

| Pitfall | How to Avoid |
|---------|-------------|
| Three.js crashes silently | Always wrap in ErrorBoundary + null checks |
| GLB model not found | Provide graceful fallback (colored box) |
| Store mutation | Use `immer` — never `state.actors.push(...)` |
| Circular imports | Only import from published `index.ts` |
| Massive files | Split at 150 LOC, hard limit at 200 LOC |
| Global state leaks | Use `createStore()` in tests, not singleton |
| R3F outside Canvas | Engine components ONLY inside `<Canvas>` |
