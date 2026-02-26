# Agent Task Queue

> This is the central task board for all Jules agents.
> Each agent reads tasks assigned to its ROLE from this file.
> When a task is completed, the agent REMOVES it from here and APPENDS it to `docs/AGENT_COMPLETED.md`.

---

## Tonight's Plan (2026-02-24)

Focus on completing **Batch 3 (Characters)** and the missing **Batch 4 (Viewport)** component to enable full scene rendering. Continue with **Batch 5 (Integration)** for export/audio capabilities.

---

## High Priority: Core Features

- [ROLE: engine-type-hardener] Review all type definitions in `packages/engine/src/types/index.ts`, remove any `any` usage, add missing interfaces
- [ROLE: engine-schema-validator] Ensure all Zod schemas in `packages/engine/src/schemas/` match TypeScript interfaces exactly
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

## Web App Tasks

- [ROLE: web-layout-dev] Refine Next.js app layout with navigation, auth placeholder in `apps/web/app/layout.tsx`
- [ROLE: web-pages-dev] Create landing page content in `apps/web/app/page.tsx`
- [ROLE: web-test-writer] Write E2E tests for main user flows (create project, add actor, play)
- [ROLE: web-layout-dev] Create Next.js app layout with navigation, auth placeholder
- [ROLE: web-pages-dev] Create landing page, /create route with editor, /explore route
- [ROLE: web-test-writer] Write E2E tests for main user flows

## Quality Tasks

- [ROLE: lint-fixer] Run eslint --fix on all packages, fix remaining issues manually
- [ROLE: security-auditor] Scan for XSS vectors, unsafe innerHTML, unvalidated inputs
- [ROLE: accessibility-auditor] Add aria-labels, keyboard navigation, screen reader support in Editor panels
- [ROLE: error-boundary-agent] Add try/catch to all async operations, ErrorBoundary to all canvas components

## Infrastructure Tasks

- [ROLE: ci-guardian] Verify CI pipeline runs correctly, add caching for pnpm
- [ROLE: dependency-updater] Check for outdated dependencies, update minor/patch versions
- [ROLE: supabase-guardian] Verify database schema matches TypeScript types

## Documentation Tasks

- [ROLE: api-docs-writer] Generate API reference from JSDoc comments
- [ROLE: changelog-writer] Update CHANGELOG.md with recent changes
- [ROLE: progress-reporter] Update PROGRESS.md and create daily report in `reports/daily/`
- [ROLE: architecture-diagrammer] Update ARCHITECTURE.md with new components

## Cleanup Tasks

- [ROLE: license-auditor] Verify all dependencies have compatible licenses
- [ROLE: bundle-watcher] Check bundle sizes, suggest tree-shaking opportunities
- [ROLE: release-preparer] Verify all packages have consistent versions, README is accurate
- [ROLE: night-reporter] Create nightly summary of all agent activity

## Unassigned Tasks

- [ROLE: any] (Conductor adds overflow tasks here for any available agent)
