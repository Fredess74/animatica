# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-04-16

### Added

- **Phase 2: Characters** initial implementation:
    - Procedural humanoid rig generation (`character/CharacterLoader.ts`).
    - Character animation system with preset clips (`character/CharacterAnimator.ts`).
    - Face morph and eye tracking controllers (`character/FaceMorphController.ts`, `character/EyeController.ts`).
    - `CharacterRenderer` R3F component with support for animations and expressions.
- **Phase 3: Editor UI** core components:
    - Modern 3-panel layout (`layouts/EditorLayout.tsx`).
    - Asset library, properties panel, and timeline UI.
    - Script console and export modal.
    - `Viewport` with interactive scene rendering, orbit controls, and actor picking.
- Enhanced benchmarking suite for engine performance tracking.
- Improved documentation including license audit and Web3 readiness reports.

### Changed

- Refactored `SceneManager` and `CharacterRenderer` for better performance and granular state updates.
- Standardized directory structure for Zod schemas in `packages/engine`.

## [0.1.0] - 2026-02-22

### Added

- **Phase 1: Engine Core** implementation:
    - TypeScript interfaces (`types/index.ts`) for Actors, Timeline, Environment, and ProjectState.
    - Zod schemas (`schemas/*.ts`) for runtime validation of all data structures.
    - Zustand store (`store/sceneStore.ts`) with Immer middleware for state management.
    - `ScriptImporter` (`importer/scriptImporter.ts`) with JSON parsing, unwrapping, and size limits.
    - Animation system including easing functions (`animation/easing.ts`) and keyframe interpolation (`animation/interpolate.ts`).
    - Scene renderers:
        - `PrimitiveRenderer` for basic shapes (box, sphere, etc.).
        - `LightRenderer` for Point, Spot, and Directional lights.
        - `CameraRenderer` for perspective cameras and helpers.
    - `SceneManager` to orchestrate rendering and state updates.
    - `PlaybackController` for managing animation playback loop.
    - AI Prompt Templates (`ai/promptTemplates.ts`) for scene generation.
    - Comprehensive unit tests for core engine components.

### Documentation

- Created initial documentation structure (`docs/`).
- Added `JULES_GUIDE.md` for AI agent instructions.
- Added `PROGRESS.md` to track project phases.
- Updated `claude.md` with current project state and architecture details.
