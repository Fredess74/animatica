# Jules Agent System — Architecture & Schedule

## Overview

40 agents organized in 5 tiers. Night schedule (8:00 PM – 8:00 AM EST).
Each slot is :00 or :30. Max 2 parallel agents per slot (different packages only).
Each agent runs ≤ 30 minutes.

## File System

| File | Purpose |
|------|---------|
| `docs/AGENT_TASKS.md` | Task queue — agents read tasks tagged `[ROLE: agent-name]` |
| `docs/AGENT_COMPLETED.md` | Done log — agents move completed tasks here |
| `.jules/TASK_LOCK.md` | File lock — prevents concurrent edits |
| `docs/JULES_GUIDE.md` | Coding standards — all agents read first |
| `docs/AGENT_SYSTEM.md` | This file — system design |

## Agent Protocol

Every agent MUST follow this exact sequence:

```
1. READ docs/JULES_GUIDE.md (coding standards)
2. READ .jules/TASK_LOCK.md (check if locked)
   → If LOCKED_PACKAGE matches your package → SKIP run, do nothing
   → If lock is expired (> 25 min old) → override it
3. WRITE .jules/TASK_LOCK.md (lock your package)
4. READ docs/AGENT_TASKS.md (find tasks tagged [ROLE: your-role])
   → If no tasks for your role → check [ROLE: any] section
   → If still no tasks → SKIP run
5. DO the work (max 1 PR, max 5 files, include tests)
6. UPDATE docs/AGENT_TASKS.md (remove completed task lines)
7. APPEND to docs/AGENT_COMPLETED.md: "- [DONE] [your-role] [date] task"
8. RESET .jules/TASK_LOCK.md (set all fields to "none")
9. CREATE PR with descriptive title and body
```

## Conflict Prevention Rules

1. **One package per agent** — Engine agents NEVER touch editor files
2. **Parallel = different packages** — Two agents at same time MUST be in different packages
3. **Lock check first** — If lock exists, skip your run entirely
4. **Small PRs** — Max 5 files changed per PR
5. **No overlapping responsibilities** — Each agent has unique file scope

---

## Schedule (EST)

### Tier 0: Coordinator (8:00 PM)

| Time | Agent | Package | Role |
|------|-------|---------|------|
| 8:00 PM | Conductor | all | conductor |

### Tier 1: Code Builders (8:30 PM – 12:00 AM)

| Time | Slot A (Engine) | Slot B (Editor) |
|------|----------------|-----------------|
| 8:30 PM | Engine Type Hardener | Editor Layout Dev |
| 9:00 PM | Engine Schema Validator | Editor Components Dev |
| 9:30 PM | Engine Animation Dev | Editor Properties Dev |
| 10:00 PM | Engine Scene Dev | Editor Timeline Dev |
| 10:30 PM | Engine Playback Dev | Editor Viewport Dev |
| 11:00 PM | Engine Store Optimizer | Editor Modal Dev |
| 11:30 PM | Engine Test Writer | Editor Style Polisher |
| 12:00 AM | Engine API Docs | Editor Test Writer |

### Tier 2: Web & Platform (12:30 AM – 2:00 AM)

| Time | Slot A (Web) | Slot B (Platform) |
|------|-------------|-------------------|
| 12:30 AM | Web Layout Dev | Supabase Guardian |
| 1:00 AM | Web Pages Dev | Feature Flag Manager |
| 1:30 AM | Web API Dev | i18n Preparer |
| 2:00 AM | Web Test Writer | — |

### Tier 3: Quality (2:30 AM – 4:30 AM)

| Time | Slot A | Slot B |
|------|--------|--------|
| 2:30 AM | Type Auditor | License Auditor |
| 3:00 AM | Lint Fixer | Bundle Watcher |
| 3:30 AM | Performance Auditor | — |
| 4:00 AM | Security Auditor | — |
| 4:30 AM | Accessibility Auditor | Error Boundary Agent |

### Tier 4: Documentation (5:00 AM – 6:30 AM)

| Time | Slot A | Slot B |
|------|--------|--------|
| 5:00 AM | API Docs Writer | Changelog Writer |
| 5:30 AM | README Updater | Architecture Diagrammer |
| 6:00 AM | Progress Reporter | — |

### Tier 5: Validation (6:30 AM – 7:30 AM)

| Time | Agent |
|------|-------|
| 6:30 AM | CI Guardian (Gate Agent) |
| 7:00 AM | Release Preparer |
| 7:30 AM | Night Reporter |

---

## Agent Count by Category

| Category | Count | Agents |
|----------|-------|--------|
| Coordinator | 1 | Conductor |
| Engine | 8 | TypeHardener, SchemaValidator, AnimationDev, SceneDev, PlaybackDev, StoreOptimizer, TestWriter, APIDocs |
| Editor | 8 | LayoutDev, ComponentsDev, PropertiesDev, TimelineDev, ViewportDev, ModalDev, StylePolisher, TestWriter |
| Web/Platform | 7 | WebLayoutDev, WebPagesDev, WebAPIDev, WebTestWriter, SupabaseGuardian, FeatureFlagManager, i18nPreparer |
| Quality | 6 | TypeAuditor, LintFixer, PerfAuditor, SecurityAuditor, AccessibilityAuditor, ErrorBoundaryAgent |
| Documentation | 5 | APIDocsWriter, ChangelogWriter, ReadmeUpdater, ArchitectureDiagrammer, ProgressReporter |
| Infrastructure | 2 | CIGuardian, DependencyUpdater→BundleWatcher |
| Cleanup | 3 | LicenseAuditor, ReleasePreparer, NightReporter |
| **Total** | **40** | |
