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

- [ ] [ROLE: editor-style-polisher] Create `panels.css`, `modals.css`, `timeline.css` using design-tokens.css variables
- [ ] [ROLE: editor-layout-dev] Add panel resizing (drag between panels) and panel collapsing
- [ ] [ROLE: editor-test-writer] Fix `Viewport.test.tsx` by adding `ContactShadows` and `Environment` to `@react-three/drei` mock

## Phase 2: Characters (Priority: HIGH)

- [ ] [ROLE: character-dev] Implement `packages/engine/src/characters/BoneController.ts` (Map body pose to bone rotations)
- [ ] [ROLE: character-dev] Implement `packages/engine/src/characters/MorphTargets.ts` (Apply facial expressions to mesh)
- [ ] [ROLE: character-dev] Implement `packages/engine/src/characters/ClothingSystem.ts` (Procedural clothing attachment)
- [ ] [ROLE: engine-test-writer] Fix `CharacterRenderer.test.tsx` for `forwardRef` compatibility

## Phase 4: Export & Audio (Priority: MEDIUM)

- [ ] [ROLE: engine-playback-dev] Implement real frame export using Canvas.toDataURL() per frame
- [ ] [ROLE: engine-playback-dev] Add audio track type to timeline (AudioActor with src, volume, startTime)
- [ ] [ROLE: editor-timeline-dev] Add audio waveform visualization in timeline

## Engine Quality (Priority: MEDIUM)

- [ ] [ROLE: engine-store-optimizer] Add undo/redo middleware to sceneStore using zustand temporal
- [ ] [ROLE: engine-store-optimizer] Create computed selectors: useActorById, useSelectedActor, useActorsByType

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

## Unassigned Tasks

- [ROLE: any] (Conductor adds overflow tasks here for any available agent)
