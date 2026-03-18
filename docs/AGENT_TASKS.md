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

## Tonight's Plan (2026-03-18)

Focus on resolving regressions in **CharacterRenderer** tests and fixing **import case-sensitivity** in the editor package. Continue with **Batch 2 (Rendering)** stabilization and **Batch 3 (Characters)**.

---

## High Priority: Core Features

- [ROLE: engine-type-hardener] Review all type definitions in `packages/engine/src/types/index.ts`, remove any `any` usage, add missing interfaces
- [ROLE: engine-schema-validator] Ensure all Zod schemas in `packages/engine/src/schemas/` match TypeScript interfaces exactly
- [ROLE: engine-animation-dev] Add missing easing functions (bounce, elastic, back) to `packages/engine/src/animation/easing.ts`
- [ROLE: engine-test-writer] Repair `CharacterRenderer.test.tsx` (handle memo/forwardRef)
- [ROLE: engine-api-docs] Add JSDoc comments to all exported functions in `packages/engine/src/index.ts`
- [ROLE: character-dev] Implement `packages/engine/src/characters/BoneController.ts` (Map body pose to bone rotations)
- [ROLE: character-dev] Implement `packages/engine/src/characters/MorphTargets.ts` (Apply facial expressions to mesh)
- [ROLE: character-dev] Implement `packages/engine/src/characters/ClothingSystem.ts` (Procedural clothing attachment)

- [ROLE: editor-viewport-dev] Fix case-sensitive imports in `packages/editor/src/viewport/Viewport.tsx` (@animatica/engine -> @Animatica/engine)
- [ROLE: editor-viewport-dev] Create Viewport component with R3F Canvas + OrbitControls + SceneManager

- [ROLE: integration-dev] Implement `packages/engine/src/export/VideoExporter.tsx` (WebCodecs API or MediaRecorder for canvas capture)
- [ROLE: integration-dev] Implement `packages/engine/src/audio/AudioEngine.tsx` (Tone.js integration, spatial audio with SpeakerActor)

- [ROLE: web-integrator] Update `apps/web/app/create/page.tsx` to mount `EditorLayout` and verify full app assembly

- [ROLE: editor-layout-dev] Add responsive breakpoints to EditorLayout for tablet/mobile
- [ROLE: editor-components-dev] Create shared Button, Input, Select components using design tokens
- [ROLE: editor-timeline-dev] Wire TimelinePanel to usePlayback hook, add real keyframe rendering

## Engine Tasks

- [ROLE: engine-test-writer] Write tests for `PlaybackController.ts` in `packages/engine/src/playback/`
- [ROLE: engine-api-docs] Add JSDoc comments to all exported functions in `packages/engine/src/index.ts`
- [ROLE: engine-animation-dev] Add missing easing functions (bounce, elastic, back) to `packages/engine/src/animation/easing.ts`

## Phase 4: Export & Audio (Priority: MEDIUM)

- [ROLE: engine-playback-dev] Implement real frame export using Canvas.toDataURL() per frame
- [ROLE: engine-playback-dev] Add audio track type to timeline (AudioActor with src, volume, startTime)
- [ROLE: editor-timeline-dev] Add audio waveform visualization in timeline

## Engine Quality (Priority: MEDIUM)

- [ROLE: engine-test-writer] Add tests for SceneManager.tsx — render actors, select, camera switching
- [ROLE: engine-test-writer] Add tests for PlaybackController.ts — play, pause, seek, speed, loop
- [ROLE: engine-store-optimizer] Add undo/redo middleware to sceneStore using zustand temporal
- [ROLE: engine-store-optimizer] Create computed selectors: useActorById, useSelectedActor, useActorsByType
- [ROLE: engine-schema-validator] Verify all Zod schemas match TypeScript types exactly

## Editor Quality (Priority: MEDIUM)

- [ROLE: editor-test-writer] Write tests for EditorLayout, PropertiesPanel, TimelinePanel
- [ROLE: editor-modal-dev] Add keyboard shortcuts: Space=play/pause, Escape=close, Delete=remove actor, Ctrl+Z=undo
- [ROLE: editor-properties-dev] Wire PropertiesPanel to sceneStore — read/write selected actor properties
- [ROLE: ci-guardian] Verify CI pipeline runs correctly, add caching for pnpm
- [ROLE: dependency-updater] Check for outdated dependencies, update minor/patch versions
- [ROLE: supabase-guardian] Verify database schema matches TypeScript types

## Documentation (Priority: LOW)

- [ROLE: api-docs-writer] Generate docs/API_ENGINE.md from JSDoc in packages/engine/
- [ROLE: changelog-writer] Update CHANGELOG.md with recent merged PRs
- [ROLE: readme-updater] Update README.md with actual features and file counts
- [ROLE: architecture-diagrammer] Update docs/ARCHITECTURE.md with current component relationships
- [ROLE: progress-reporter] Update PROGRESS.md and create daily report in `reports/daily/`

## Cleanup (Priority: LOW)

- [ROLE: conductor] Delete `packages/contracts/` directory (blockchain — off-scope)
- [ROLE: conductor] Delete `docs/SMART_CONTRACTS.md` (blockchain — off-scope)
- [ROLE: lint-fixer] Run pnpm lint --fix across all packages
- [ROLE: type-auditor] Run pnpm typecheck and fix all type errors
- [ROLE: license-auditor] Verify all dependencies have compatible licenses
- [ROLE: bundle-watcher] Check bundle sizes, suggest tree-shaking opportunities
- [ROLE: release-preparer] Verify all packages have consistent versions, README is accurate
- [ROLE: night-reporter] Create nightly summary of all agent activity

## Unassigned Tasks

- [ROLE: any] (Conductor adds overflow tasks here for any available agent)
