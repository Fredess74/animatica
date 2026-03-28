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

## Phase 2: Characters (Priority: HIGH)

- [ ] [ROLE: character-dev] Implement `packages/engine/src/character/BoneController.ts` — Map body pose to bone rotations
- [ ] [ROLE: character-dev] Implement `packages/engine/src/character/MorphTargets.ts` — Apply facial expressions to mesh
- [ ] [ROLE: character-dev] Implement `packages/engine/src/character/ClothingSystem.ts` — Procedural clothing attachment
- [ ] [ROLE: engine-scene-dev] Create character presets: cowboy (hat + vest), robot (metallic), android (glowing) in `packages/engine/src/character/CharacterPresets.ts`

## Phase 4: Export & Audio (Priority: MEDIUM)

- [ ] [ROLE: integration-dev] Implement `packages/engine/src/export/VideoExporter.tsx` — WebCodecs API or MediaRecorder for canvas capture
- [ ] [ROLE: integration-dev] Implement `packages/engine/src/audio/AudioEngine.tsx` — Tone.js integration, spatial audio with SpeakerActor
- [ ] [ROLE: editor-timeline-dev] Add audio waveform visualization in timeline

## Engine Quality (Priority: MEDIUM)

- [ ] [ROLE: engine-store-optimizer] Add undo/redo middleware to sceneStore using zustand temporal
- [ ] [ROLE: engine-schema-validator] Verify all Zod schemas match TypeScript types exactly
- [ ] [ROLE: engine-test-writer] Add tests for `PlaybackController.ts` and `SceneManager.tsx`

## Editor Quality (Priority: MEDIUM)

- [ ] [ROLE: editor-modal-dev] Add keyboard shortcuts: Space=play/pause, Escape=close, Delete=remove actor, Ctrl+Z=undo
- [ ] [ROLE: editor-layout-dev] Add panel resizing (drag between panels) and panel collapsing

## Documentation & Cleanup (Priority: LOW)

- [ ] [ROLE: api-docs-writer] Generate docs/API_ENGINE.md from JSDoc in packages/engine/
- [ ] [ROLE: architecture-diagrammer] Update docs/ARCHITECTURE.md with current component relationships
- [ ] [ROLE: lint-fixer] Run eslint --fix on all packages
- [ ] [ROLE: type-auditor] Run pnpm typecheck and fix all type errors
