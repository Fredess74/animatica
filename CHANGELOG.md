# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Phase 2: Characters**:
    - Procedural humanoid rig with head, torso, and limbs.
    - Bone controller for mapping body poses to skeleton.
    - Face morph system for expressions and eye blinking.
    - Character preset system (Cowboy, Robot, Android).
    - `CharacterRenderer` for rendering characters in the scene.
- **Phase 3: Editor UI**:
    - `Viewport` component with R3F Canvas, OrbitControls, and TransformGizmo.
    - 2D Storyboard mode for quick scene sketching.
    - Keyboard shortcuts for editor operations (W, E, R, Q, etc.).
    - API routes for project CRUD operations.
    - CSS styling for all editor panels and modals.
    - i18n support for editor strings.
- **Phase 5: AI Integration**:
    - Foundation for AI-driven scene generation.

### Fixed
- Improved type safety across the engine and editor packages.
- Optimized re-renders in the property panel and timeline.
- Fixed character renderer test regressions.
- Fixed viewport component test regressions.

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
