# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-25

### Added

- **Phase 2: Characters** implementation:
    - Procedural humanoid rig with `createProceduralHumanoid`.
    - `CharacterRenderer` for rendering characters with animation and face morphs.
    - `CharacterAnimator` with clips for idle, walk, run, talk, wave, dance, sit, and jump.
    - `FaceMorphController` and `EyeController` for character expressions and eye tracking.
- **Phase 3: Editor UI** implementation:
    - Multi-panel `EditorLayout` (Assets, Properties, Viewport, Timeline).
    - `AssetLibrary` for adding actors to the scene.
    - `PropertiesPanel` for adjusting actor transforms and properties.
    - `TimelinePanel` with playback controls and playhead.
    - `ScriptConsole` for direct JSON scene importing.
    - `ExportModal` for video export configuration.
- **Phase 5: AI Integration** foundation:
    - `ai/promptTemplates.ts` for AI-assisted scene generation.

### Changed

- Updated monorepo version to 0.2.0.
- Improved `SceneManager` to support character rendering.

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
