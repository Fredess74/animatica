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

## Phase 4: Export & Audio (Priority: MEDIUM)

- [ ] [ROLE: engine-playback-dev] Implement real frame export using Canvas.toDataURL() per frame
- [ ] [ROLE: engine-playback-dev] Add audio track type to timeline (AudioActor with src, volume, startTime)
- [ ] [ROLE: editor-timeline-dev] Add audio waveform visualization in timeline

## Engine Quality (Priority: MEDIUM)

- [ ] [ROLE: engine-test-writer] Add tests for SceneManager.tsx — render actors, select, camera switching
- [ ] [ROLE: engine-test-writer] Add tests for PlaybackController.ts — play, pause, seek, speed, loop
- [ ] [ROLE: engine-store-optimizer] Add undo/redo middleware to sceneStore using zustand temporal
- [ ] [ROLE: engine-store-optimizer] Create computed selectors: useActorById, useSelectedActor, useActorsByType
- [ ] [ROLE: engine-schema-validator] Verify all Zod schemas match TypeScript types exactly

## Editor Quality (Priority: MEDIUM)

- [ ] [ROLE: editor-test-writer] Write tests for EditorLayout, PropertiesPanel, TimelinePanel
- [ ] [ROLE: editor-modal-dev] Add keyboard shortcuts: Space=play/pause, Escape=close, Delete=remove actor, Ctrl+Z=undo
- [ ] [ROLE: editor-properties-dev] Wire PropertiesPanel to sceneStore — read/write selected actor properties

## Documentation (Priority: LOW)

- [ ] [ROLE: api-docs-writer] Generate docs/API_ENGINE.md from JSDoc in packages/engine/
- [ ] [ROLE: changelog-writer] Update CHANGELOG.md with recent merged PRs
- [ ] [ROLE: readme-updater] Update README.md with actual features and file counts
- [ ] [ROLE: architecture-diagrammer] Update docs/ARCHITECTURE.md with current component relationships

## Cleanup (Priority: LOW)

- [ ] [ROLE: conductor] Delete `packages/contracts/` directory (blockchain — off-scope)
- [ ] [ROLE: conductor] Delete `docs/SMART_CONTRACTS.md` (blockchain — off-scope)
- [ ] [ROLE: lint-fixer] Run pnpm lint --fix across all packages
- [ ] [ROLE: type-auditor] Run pnpm typecheck and fix all type errors
