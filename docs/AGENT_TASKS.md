# Agent Task Queue

> This is the central task board for all Jules agents.
> Each agent reads tasks assigned to its ROLE from this file.
> When a task is completed, the agent REMOVES it from here and APPENDS it to `docs/AGENT_COMPLETED.md`.

---

## How It Works

1. The **Conductor** agent runs first each night and populates this file with tasks
2. Each agent reads ONLY tasks tagged with its role: `[ROLE: agent-name]`
3. After completing a task, the agent:
   - Removes the task line from this file
   - Appends `- [DONE] [agent-name] [YYYY-MM-DD] task description` to `docs/AGENT_COMPLETED.md`
4. If no tasks are assigned to your role, check the `[ROLE: any]` section

---

## Engine Tasks

- [ROLE: engine-type-hardener] Review all type definitions in `packages/engine/src/types/index.ts`, remove any `any` usage, add missing interfaces
- [ROLE: engine-schema-validator] Ensure all Zod schemas in `packages/engine/src/schemas/` match TypeScript interfaces exactly
- [ROLE: engine-animation-dev] Add missing easing functions (bounce, elastic, back) to `packages/engine/src/animation/easing.ts`
- [ROLE: engine-playback-dev] Add speed controls and loop modes to PlaybackController
- [ROLE: engine-test-writer] Write tests for PlaybackController
- [ROLE: engine-api-docs] Add JSDoc comments to all exported functions in `packages/engine/src/index.ts`

## Editor Tasks

- [ROLE: editor-layout-dev] Add responsive breakpoints to EditorLayout for tablet/mobile
- [ROLE: editor-components-dev] Create shared Button, Input, Select components using design tokens
- [ROLE: editor-timeline-dev] Wire TimelinePanel to usePlayback hook, add real keyframe rendering
- [ROLE: editor-viewport-dev] Create Viewport component with R3F Canvas + OrbitControls + SceneManager

## Web App Tasks

- [ROLE: web-layout-dev] Create Next.js app layout with navigation, auth placeholder
- [ROLE: web-pages-dev] Create landing page, /create route with editor, /explore route
- [ROLE: web-api-dev] Create API routes for project CRUD operations
- [ROLE: web-test-writer] Write E2E tests for main user flows

## Quality Tasks

- [ROLE: security-auditor] Scan for XSS vectors, unsafe innerHTML, unvalidated inputs
- [ROLE: accessibility-auditor] Add aria-labels, keyboard navigation, screen reader support
- [ROLE: error-boundary-agent] Add try/catch to all async operations, ErrorBoundary to all canvas components

## Infrastructure Tasks

- [ROLE: ci-guardian] Verify CI pipeline runs correctly, add caching for pnpm
- [ROLE: dependency-updater] Check for outdated dependencies, update minor/patch versions
- [ROLE: supabase-guardian] Verify database schema matches TypeScript types

## Documentation Tasks

- [ROLE: api-docs-writer] Generate API reference from JSDoc comments
- [ROLE: readme-updater] Update README.md with current features, quick start guide
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
