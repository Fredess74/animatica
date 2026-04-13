# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-05-22

### Added

- **Phase 2: Characters** progress:
    - Defined humanoid character system and skeletal animation structures.
    - Implemented `CharacterRenderer` with support for procedural rig generation and skeletal animation.
    - Added character animation system with clips for idle, walk, run, talk, etc.
    - Character preset system with skin color, height, and build customization.
- **Phase 3: Editor UI** progress:
    - Standardized Editor layout with multi-panel system.
    - Implemented Asset Library for adding scene actors.
    - Added Properties Panel for actor and environment configuration.
    - Developed Timeline Panel with playhead scrubber and keyframe visualization.
    - Integrated Viewport with gizmo support for actor transformation.
- **Phase 4 & 5 Integration**:
    - Script importer for AI-generated scene descriptions.
    - AI Prompt Templates for scene generation.
    - Export modal for rendering and download configuration.

### Fixed

- Resolved regressions in `CharacterRenderer.test.tsx` and `Viewport.test.tsx`.
- Improved test coverage for engine components and editor hooks.

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
