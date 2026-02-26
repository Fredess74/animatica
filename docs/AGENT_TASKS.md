# Agent Task Queue

> Central task queue for Jules agents. Each task is tagged with `[ROLE: agent-name]`.
> Agents: read your tasks → do them → remove from here → add to AGENT_COMPLETED.md

---

<<<<<<< HEAD
## ⚠️ CRITICAL RULES (ALL AGENTS)

```
1. git pull origin main --rebase BEFORE creating your branch
2. FORBIDDEN: blockchain, Web3, NFTs, smart contracts, cryptocurrency
3. Do NOT edit AGENT_TASKS.md or AGENT_COMPLETED.md in your feature PR
4. Max 5 files per PR. One package per PR.
5. Use pnpm, not npm or yarn.
```

---

## Phase 3: Editor UI — Viewport (Priority: HIGH)

- [ ] [ROLE: editor-viewport-dev] Create `packages/editor/src/viewport/Viewport.tsx` — R3F Canvas with OrbitControls, SceneManager, grid helper, and transform gizmo for selected actor
- [ ] [ROLE: editor-viewport-dev] Add camera controls toolbar (top/front/side/perspective views)
- [ ] [ROLE: editor-components-dev] Create shared UI primitives in `packages/editor/src/components/` — Button, Input, Select, Tooltip, IconButton
- [ ] [ROLE: editor-style-polisher] Create `panels.css`, `modals.css`, `timeline.css` using design-tokens.css variables
- [ ] [ROLE: editor-layout-dev] Add panel resizing (drag between panels) and panel collapsing

## Phase 2: Characters (Priority: HIGH)

- [ ] [ROLE: engine-scene-dev] Create `packages/engine/src/scene/renderers/HumanoidRenderer.tsx` — base procedural humanoid with head, torso, limbs
- [ ] [ROLE: engine-animation-dev] Add character animation system — walk, idle, wave poses using keyframe engine
- [ ] [ROLE: engine-scene-dev] Create character presets: cowboy (hat + vest), robot (metallic), android (glowing)
- [ ] [ROLE: engine-type-hardener] Add Character-specific types to `types/index.ts`
=======
## Tonight's Plan (2026-02-24)

Focus on completing **Batch 3 (Characters)** and the missing **Batch 4 (Viewport)** component to enable full scene rendering. Continue with **Batch 5 (Integration)** for export/audio capabilities.

---

## High Priority: Core Features

- [ROLE: engine-type-hardener] Review all type definitions in `packages/engine/src/types/index.ts`, remove any `any` usage, add missing interfaces
- [ROLE: engine-schema-validator] Ensure all Zod schemas in `packages/engine/src/schemas/` match TypeScript interfaces exactly
- [ROLE: engine-animation-dev] Add missing easing functions (bounce, elastic, back) to `packages/engine/src/animation/easing.ts`
- [ROLE: engine-test-writer] Write tests for PlaybackController
- [ROLE: engine-api-docs] Add JSDoc comments to all exported functions in `packages/engine/src/index.ts`
- [ROLE: character-dev] Implement `packages/engine/src/characters/BoneController.ts` (Map body pose to bone rotations)
- [ROLE: character-dev] Implement `packages/engine/src/characters/MorphTargets.ts` (Apply facial expressions to mesh)
- [ROLE: character-dev] Implement `packages/engine/src/characters/ClothingSystem.ts` (Procedural clothing attachment)
- [ROLE: character-dev] Create `packages/engine/src/characters/Humanoid.tsx` (Load ReadyPlayerMe GLB, handle idle animation)

- [ROLE: editor-viewport-dev] Create `packages/editor/src/components/Viewport.tsx` (R3F Canvas, SceneManager, OrbitControls, TransformControls)

- [ROLE: integration-dev] Implement `packages/engine/src/export/VideoExporter.tsx` (WebCodecs API or MediaRecorder for canvas capture)
- [ROLE: integration-dev] Implement `packages/engine/src/audio/AudioEngine.tsx` (Tone.js integration, spatial audio with SpeakerActor)

- [ROLE: web-integrator] Update `apps/web/app/create/page.tsx` to mount `EditorLayout` and verify full app assembly

- [ROLE: editor-layout-dev] Add responsive breakpoints to EditorLayout for tablet/mobile
- [ROLE: editor-components-dev] Create shared Button, Input, Select components using design tokens
- [ROLE: editor-viewport-dev] Create Viewport component with R3F Canvas + OrbitControls + SceneManager
- [ROLE: editor-timeline-dev] Wire TimelinePanel to usePlayback hook, add real keyframe rendering
## Engine Tasks

- [ROLE: engine-test-writer] Write tests for `PlaybackController.ts` in `packages/engine/src/playback/`
- [ROLE: engine-api-docs] Add JSDoc comments to all exported functions in `packages/engine/src/index.ts`
- [ROLE: engine-animation-dev] Add missing easing functions (bounce, elastic, back) to `packages/engine/src/animation/easing.ts`
>>>>>>> ceb56b06ce7323a3b62882d6d2f357210a054528

## Phase 4: Export & Audio (Priority: MEDIUM)

<<<<<<< HEAD
- [ ] [ROLE: engine-playback-dev] Implement real frame export using Canvas.toDataURL() per frame
- [ ] [ROLE: engine-playback-dev] Add audio track type to timeline (AudioActor with src, volume, startTime)
- [ ] [ROLE: editor-timeline-dev] Add audio waveform visualization in timeline
=======
- [ROLE: web-layout-dev] Refine Next.js app layout with navigation, auth placeholder in `apps/web/app/layout.tsx`
- [ROLE: web-pages-dev] Create landing page content in `apps/web/app/page.tsx`
- [ROLE: web-test-writer] Write E2E tests for main user flows (create project, add actor, play)
- [ROLE: web-layout-dev] Create Next.js app layout with navigation, auth placeholder
- [ROLE: web-pages-dev] Create landing page, /create route with editor, /explore route
- [ROLE: web-test-writer] Write E2E tests for main user flows
>>>>>>> ceb56b06ce7323a3b62882d6d2f357210a054528

## Engine Quality (Priority: MEDIUM)

<<<<<<< HEAD
- [ ] [ROLE: engine-test-writer] Add tests for SceneManager.tsx — render actors, select, camera switching
- [ ] [ROLE: engine-test-writer] Add tests for PlaybackController.ts — play, pause, seek, speed, loop
- [ ] [ROLE: engine-store-optimizer] Add undo/redo middleware to sceneStore using zustand temporal
- [ ] [ROLE: engine-store-optimizer] Create computed selectors: useActorById, useSelectedActor, useActorsByType
- [ ] [ROLE: engine-schema-validator] Verify all Zod schemas match TypeScript types exactly
=======
- [ROLE: lint-fixer] Run eslint --fix on all packages, fix remaining issues manually
- [ROLE: security-auditor] Scan for XSS vectors, unsafe innerHTML, unvalidated inputs
- [ROLE: accessibility-auditor] Add aria-labels, keyboard navigation, screen reader support in Editor panels
- [ROLE: error-boundary-agent] Add try/catch to all async operations, ErrorBoundary to all canvas components
>>>>>>> ceb56b06ce7323a3b62882d6d2f357210a054528

## Editor Quality (Priority: MEDIUM)

<<<<<<< HEAD
- [ ] [ROLE: editor-test-writer] Write tests for EditorLayout, PropertiesPanel, TimelinePanel
- [ ] [ROLE: editor-modal-dev] Add keyboard shortcuts: Space=play/pause, Escape=close, Delete=remove actor, Ctrl+Z=undo
- [ ] [ROLE: editor-properties-dev] Wire PropertiesPanel to sceneStore — read/write selected actor properties
=======
- [ROLE: ci-guardian] Verify CI pipeline runs correctly, add caching for pnpm
- [ROLE: dependency-updater] Check for outdated dependencies, update minor/patch versions
- [ROLE: supabase-guardian] Verify database schema matches TypeScript types
>>>>>>> ceb56b06ce7323a3b62882d6d2f357210a054528

## Documentation (Priority: LOW)

<<<<<<< HEAD
- [ ] [ROLE: api-docs-writer] Generate docs/API_ENGINE.md from JSDoc in packages/engine/
- [ ] [ROLE: changelog-writer] Update CHANGELOG.md with recent merged PRs
- [ ] [ROLE: readme-updater] Update README.md with actual features and file counts
- [ ] [ROLE: architecture-diagrammer] Update docs/ARCHITECTURE.md with current component relationships
=======
- [ROLE: api-docs-writer] Generate API reference from JSDoc comments
- [ROLE: changelog-writer] Update CHANGELOG.md with recent changes
- [ROLE: progress-reporter] Update PROGRESS.md and create daily report in `reports/daily/`
- [ROLE: architecture-diagrammer] Update ARCHITECTURE.md with new components
>>>>>>> ceb56b06ce7323a3b62882d6d2f357210a054528

## Cleanup (Priority: LOW)

<<<<<<< HEAD
- [ ] [ROLE: conductor] Delete `packages/contracts/` directory (blockchain — off-scope)
- [ ] [ROLE: conductor] Delete `docs/SMART_CONTRACTS.md` (blockchain — off-scope)
- [ ] [ROLE: lint-fixer] Run pnpm lint --fix across all packages
- [ ] [ROLE: type-auditor] Run pnpm typecheck and fix all type errors
=======
- [ROLE: license-auditor] Verify all dependencies have compatible licenses
- [ROLE: bundle-watcher] Check bundle sizes, suggest tree-shaking opportunities
- [ROLE: release-preparer] Verify all packages have consistent versions, README is accurate
- [ROLE: night-reporter] Create nightly summary of all agent activity

## Unassigned Tasks

- [ROLE: any] (Conductor adds overflow tasks here for any available agent)
>>>>>>> ceb56b06ce7323a3b62882d6d2f357210a054528
