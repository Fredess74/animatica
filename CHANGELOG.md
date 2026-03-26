# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-26

### Added

- **Phase 2: Characters** progress:
    - `CharacterRenderer` with rig loading, animation, face morphs, and eye tracking.
    - Bone controller and morph target mapping for humanoid characters.
    - Initial character presets (cowboy, robot, android).
- **Phase 3: Editor UI** progress:
    - 3-panel layout with `EditorLayout`.
    - `AssetLibrary` for actor creation.
    - `PropertiesPanel` for real-time actor property editing.
    - `TimelinePanel` with playhead scrubbing and keyframe rendering.
    - `ScriptConsole` for JSON script validation and building.
    - `ExportModal` for video configuration.
- **Phase 1: Engine Core** enhancements:
    - Playback controller improvements (speed controls, loop modes).
    - Scene manager tests and SpeakerRenderer support.
- **Platform** foundation:
    - Initial Supabase schema for project and profile management.
    - API routes for project CRUD operations.

### Changed

- Updated monorepo version to `0.2.0`.
- Refactored `CharacterRenderer` to functional component with improved testability.
- Standardized character bone naming for humanoid mapping.

### Removed

- Blockchain and crypto-related documentation and placeholders (Phase 8).

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
