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

## Phase 3: Editor UI (Priority: HIGH)

- [ ] [ROLE: editor-viewport-dev] Add camera controls toolbar (top/front/side/perspective views)
- [ ] [ROLE: editor-components-dev] Create shared UI primitives in `packages/editor/src/components/` — Button, Input, Select, Tooltip, IconButton
- [ ] [ROLE: editor-style-polisher] Create `panels.css`, `modals.css`, `timeline.css` using design-tokens.css variables
- [ ] [ROLE: editor-layout-dev] Add panel resizing (drag between panels) and panel collapsing
- [ ] [ROLE: editor-layout-dev] Add responsive breakpoints to EditorLayout for tablet/mobile
- [ ] [ROLE: editor-timeline-dev] Wire TimelinePanel to usePlayback hook, add real keyframe rendering

## Phase 2: Characters (Priority: HIGH)

- [ ] [ROLE: engine-scene-dev] Create `packages/engine/src/scene/renderers/HumanoidRenderer.tsx` — base procedural humanoid with head, torso, limbs
- [ ] [ROLE: engine-animation-dev] Add character animation system — walk, idle, wave poses using keyframe engine
- [ ] [ROLE: engine-scene-dev] Create character presets: cowboy (hat + vest), robot (metallic), android (glowing)
- [ ] [ROLE: engine-type-hardener] Add Character-specific types to `types/index.ts`
- [ ] [ROLE: character-dev] Implement `packages/engine/src/characters/BoneController.ts` (Map body pose to bone rotations)
- [ ] [ROLE: character-dev] Implement `packages/engine/src/characters/MorphTargets.ts` (Apply facial expressions to mesh)
- [ ] [ROLE: character-dev] Implement `packages/engine/src/characters/ClothingSystem.ts` (Procedural clothing attachment)
- [ ] [ROLE: character-dev] Create `packages/engine/src/characters/Humanoid.tsx` (Load ReadyPlayerMe GLB, handle idle animation)

## Phase 4: Export & Audio (Priority: MEDIUM)

- [ ] [ROLE: engine-playback-dev] Implement real frame export using Canvas.toDataURL() per frame
- [ ] [ROLE: engine-playback-dev] Add audio track type to timeline (AudioActor with src, volume, startTime)
- [ ] [ROLE: editor-timeline-dev] Add audio waveform visualization in timeline
- [ ] [ROLE: integration-dev] Implement `packages/engine/src/export/VideoExporter.tsx` (WebCodecs API or MediaRecorder for canvas capture)
- [ ] [ROLE: integration-dev] Implement `packages/engine/src/audio/AudioEngine.tsx` (Tone.js integration, spatial audio with SpeakerActor)

## Web & Platform (Priority: MEDIUM)

- [ ] [ROLE: web-integrator] Update `apps/web/app/create/page.tsx` to mount `EditorLayout` and verify full app assembly
- [ ] [ROLE: web-layout-dev] Refine Next.js app layout with navigation, auth placeholder in `apps/web/app/layout.tsx`
- [ ] [ROLE: web-pages-dev] Create landing page content in `apps/web/app/page.tsx`
- [ ] [ROLE: web-test-writer] Write E2E tests for main user flows (create project, add actor, play)

## Quality Assurance (Priority: MEDIUM)

- [ ] [ROLE: engine-test-writer] Add tests for SceneManager.tsx — render actors, select, camera switching
- [ ] [ROLE: engine-test-writer] Write tests for `PlaybackController.ts` in `packages/engine/src/playback/`
- [ ] [ROLE: engine-store-optimizer] Add undo/redo middleware to sceneStore using zustand temporal
- [ ] [ROLE: engine-store-optimizer] Create computed selectors: useActorById, useSelectedActor, useActorsByType
- [ ] [ROLE: engine-schema-validator] Verify all Zod schemas match TypeScript types exactly
- [ ] [ROLE: lint-fixer] Run eslint --fix on all packages, fix remaining issues manually
- [ ] [ROLE: security-auditor] Scan for XSS vectors, unsafe innerHTML, unvalidated inputs
- [ ] [ROLE: accessibility-auditor] Add aria-labels, keyboard navigation, screen reader support in Editor panels
- [ ] [ROLE: error-boundary-agent] Add try/catch to all async operations, ErrorBoundary to all canvas components

## Cleanup & Documentation (Priority: LOW)

- [ ] [ROLE: conductor] Delete `packages/contracts/` directory (blockchain — off-scope)
- [ ] [ROLE: conductor] Delete `docs/SMART_CONTRACTS.md` (blockchain — off-scope)
- [ ] [ROLE: api-docs-writer] Generate docs/API_ENGINE.md from JSDoc in packages/engine/
- [ ] [ROLE: changelog-writer] Update CHANGELOG.md with recent merged PRs
- [ ] [ROLE: readme-updater] Update README.md with actual features and file counts
- [ ] [ROLE: architecture-diagrammer] Update docs/ARCHITECTURE.md with current component relationships
- [ ] [ROLE: license-auditor] Verify all dependencies have compatible licenses
- [ ] [ROLE: bundle-watcher] Check bundle sizes, suggest tree-shaking opportunities
- [ ] [ROLE: release-preparer] Verify all packages have consistent versions, README is accurate
- [ ] [ROLE: night-reporter] Create nightly summary of all agent activity
