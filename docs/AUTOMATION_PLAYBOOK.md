# Animatica Automation Playbook

## The Goal

Growth every single day. The product must expand **horizontally** (new features, new asset types, new platform integrations) and deepen **vertically** (performance optimization, complex rendering, deeper AI integration) with minimal human bottleneck.

To achieve this, we treat Jules not as a one-time wizard, but as an **autonomous perpetual employee**.

---

## ⚙️ The Automation Architecture

This system allows Jules to work 24/7. Your role shifts from "writing code" to "writing issues."

### 1. The Backlog (Jules Queue)

We use a **GitHub Project Board** connected to the repository.
Columns: `Todo (JulesQueue)`, `In Progress (JulesWorking)`, `In Review (CI/Human)`, `Done`.

### 2. The Task Generator

You (the Founder) or an AI PM agent drops tasks into the `Todo` column using the `Jules Task` issue template (`.github/ISSUE_TEMPLATE/jules_task.yml`).

### 3. The CI Guardrails (Strict Enforcement)

When Jules opens a Pull Request to solve an issue, GitHub Actions (`.github/workflows/ci.yml`) automatically runs:

1. `npm run typecheck` — 0 TypeScript errors allowed.
2. `npm run test` — Unit tests must pass.
3. `npm run lint` — No unused variables or explicit `any`.

**Feedback Loop:** If CI fails, the GitHub Action automatically posts a comment on the PR: `"🚨 CI Failed. @jules-ai please review the logs and fix."` Jules reads the comment, fixes the code, and pushes a new commit.

### 4. Merging Strategy

* **Vertical Tasks (Refactoring, Core Engine Updates):** Require 1-click human review to ensure architectural integrity.
* **Horizontal Tasks (New 3D Assets, New UI Panels):** If CI passes and test coverage is maintained, you can set GitHub to **Auto-Merge**.

---

## 📈 Horizontal Growth (Adding Breadth)

How to feed Jules tasks to expand the product horizontally every day:

**New Asset Types**

* Create an issue: *"Add Capsule Primitive"*
* Jules reads `JULES_GUIDE.md`, creates `CapsuleRenderer.tsx`, adds it to `SceneManager`, updates `PrimitiveActor` types, and adds tests.

**New Editor Features**

* Create an issue: *"Add Grid Snapping Toggle"*
* Jules adds state to `Zustand`, adds a `Toolbar` button, and implements snapping logic in the viewport.

**New AI Presets**

* Create an issue: *"Add 'Cyberpunk' AI Style Preset"*
* Jules updates `aiPromptTemplate.ts` with new lighting, fog, and camera instructions for the LLM.

---

## 🚀 Vertical Growth (Adding Depth)

How to push Jules to deepen the product's quality and performance:

**Refactoring for Scale**

* Create an issue: *"Refactor SceneManager to use InstancedMesh for Primitives"*
* Jules optimizes the core R3F rendering loop without changing the public API.

**Deepening Test Coverage**

* Create an issue: *"Increase Test Coverage of KeyframeEngine to 100%"*
* Jules generates edge-case unit tests.

**Performance Audits**

* Create an issue: *"Fix memory leak in PlaybackController"*
* Jules analyzes the frame loop and implements proper object disposal in Three.js.

---

## 🔄 Daily Workflow for the Founder

To become a billionaire, you cannot be writing code or fixing merge conflicts. Your daily routine should be:

1. **Morning (15 mins):** Open GitHub. Review the PRs Jules made overnight. Click `Merge` on the green ones.
2. **Strategy (30 mins):** Think about the next big feature (e.g., "Add Physics Engine"). Break it down into 3-4 small, isolated GitHub Issues using the `Jules Task` template.
3. **Queueing (5 mins):** Drag the new issues to the top of the `Todo` column.
4. **Relax:** Jules picks up the top issue, creates the branch, writes the code, adds the tests, and opens a PR.

### Why this works

* **No Merge Conflicts:** By grouping tasks into sequential "Batches" (as outlined in `JULES_GUIDE.md`), Jules never works on the same file in two different PRs at the same time.
* **Self-Healing:** The Strict CI + GitHub Actions auto-commenting means Jules fixes its own typos before you even wake up.
