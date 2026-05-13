# Agent Task Queue

> Central task queue for Jules agents. Each task is tagged with `[ROLE: agent-name]`.
> Agents: read your tasks → do them → remove from here → add to AGENT_COMPLETED.md

---

## ⚠️ CRITICAL RULES (ALL AGENTS)

```
1. git pull origin main --rebase BEFORE creating your branch
2. FORBIDDEN: blockchain, Web3, NFTs, smart contracts, cryptocurrency
3. Do NOT edit AGENT_TASKS.md or AGENT_COMPLETED.md in your feature PR
4. Max 5 files per PR. One package per PR.
5. Use pnpm, not npm or yarn.
```

---

## Tonight's Plan (2026-05-13)

Focus on stabilizing the core engine and completing Phase 2 (Characters). Address the regressions in R3F unit tests and optimize the editor bundle.

---

## High Priority: Core Features

- [ROLE: engine-type-hardener] Review all type definitions in `packages/engine/src/types/index.ts`, remove any `any` usage, add missing interfaces
- [ROLE: engine-schema-validator] Ensure all Zod schemas match TypeScript interfaces exactly. Move to `importer/schemas/`.
- [ROLE: engine-animation-dev] Add missing easing functions (bounce, elastic, back) to `packages/engine/src/animation/easing.ts`
- [ROLE: character-dev] Implement `packages/engine/src/characters/BoneController.ts` (Map body pose to bone rotations)
- [ROLE: character-dev] Implement `packages/engine/src/characters/MorphTargets.ts` (Apply facial expressions to mesh)
- [ROLE: character-dev] Implement `packages/engine/src/characters/ClothingSystem.ts` (Procedural clothing attachment)
- [ROLE: editor-viewport-dev] Create `packages/editor/src/components/Viewport.tsx` (R3F Canvas, SceneManager, OrbitControls, TransformControls)

## Phase 2: Characters

- [ ] [ROLE: engine-animation-dev] Add character animation system — walk, idle, wave poses using keyframe engine
- [ ] [ROLE: engine-scene-dev] Create character presets: cowboy (hat + vest), robot (metallic), android (glowing)
- [ ] [ROLE: engine-type-hardener] Add Character-specific types to `types/index.ts`

## Phase 3: Editor UI — Viewport

- [ ] [ROLE: editor-viewport-dev] Create `packages/editor/src/viewport/Viewport.tsx` — R3F Canvas with OrbitControls, SceneManager, grid helper, and transform gizmo for selected actor
- [ ] [ROLE: editor-viewport-dev] Add camera controls toolbar (top/front/side/perspective views)
- [ ] [ROLE: editor-components-dev] Create shared UI primitives in `packages/editor/src/components/` — Button, Input, Select, Tooltip, IconButton
- [ ] [ROLE: editor-style-polisher] Create `panels.css`, `modals.css`, `timeline.css` using design-tokens.css variables
- [ ] [ROLE: editor-layout-dev] Add panel resizing (drag between panels) and panel collapsing

## Phase 4: Export & Audio

- [ ] [ROLE: engine-playback-dev] Implement real frame export using Canvas.toDataURL() per frame
- [ ] [ROLE: engine-playback-dev] Add audio track type to timeline (AudioActor with src, volume, startTime)
- [ ] [ROLE: editor-timeline-dev] Add audio waveform visualization in timeline
- [ROLE: integration-dev] Implement `packages/engine/src/export/VideoExporter.tsx` (WebCodecs API or MediaRecorder for canvas capture)
- [ROLE: integration-dev] Implement `packages/engine/src/audio/AudioEngine.tsx` (Tone.js integration, spatial audio with SpeakerActor)

## Quality & Stability

- [ ] [ROLE: engine-test-writer] Add tests for SceneManager.tsx — render actors, select, camera switching
- [ ] [ROLE: engine-test-writer] Add tests for PlaybackController.ts — play, pause, seek, speed, loop
- [ ] [ROLE: engine-store-optimizer] Add undo/redo middleware to sceneStore using zustand temporal
- [ ] [ROLE: engine-store-optimizer] Create computed selectors: useActorById, useSelectedActor, useActorsByType
- [ROLE: engine-test-writer] Fix `CharacterRenderer.test.tsx` and `Viewport.test.tsx` regressions
- [ROLE: bundle-watcher] Identify tree-shaking opportunities for `@Animatica/editor`

## Documentation

- [ ] [ROLE: api-docs-writer] Generate docs/API_ENGINE.md from JSDoc in packages/engine/
- [ ] [ROLE: changelog-writer] Update CHANGELOG.md with recent merged PRs
- [ ] [ROLE: readme-updater] Update README.md with actual features and file counts
- [ ] [ROLE: architecture-diagrammer] Update docs/ARCHITECTURE.md with current component relationships
- [ROLE: api-docs-writer] Generate API reference from JSDoc comments
- [ROLE: progress-reporter] Update PROGRESS.md

## Cleanup

- [ ] [ROLE: conductor] Delete `packages/contracts/` directory (blockchain — off-scope)
- [ ] [ROLE: conductor] Delete `docs/SMART_CONTRACTS.md` (blockchain — off-scope)
- [ ] [ROLE: lint-fixer] Run pnpm lint --fix across all packages
- [ ] [ROLE: type-auditor] Run pnpm typecheck and fix all type errors
- [ROLE: release-preparer] Verify all packages have consistent versions, README is accurate
- [ROLE: night-reporter] Generate nightly status reports

## Unassigned Tasks

- [ROLE: any] (Conductor adds overflow tasks here for any available agent)
