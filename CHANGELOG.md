# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-20

### Added

- **Phase 2: Characters** implementation:
    - `BoneController` for skeletal posing and bone rotation mapping.
    - `CharacterAnimator` with multiple clip support (dance, jump, talk, etc.).
    - `FaceMorphController` and `EyeController` for character expressions.
    - `CharacterRenderer` R3F component with automatic rig generation.
- **Phase 3: Editor UI** components:
    - Full 3-panel editor layout.
    - Panels for Asset Library, Properties, Timeline, and Script Console.
    - Export Modal for video configuration.
- **Phase 10: 2D Mode** early access:
    - Storyboard 2D mode for rapid scene planning.
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

### Fixed

- Resolved unit test failures in `CharacterRenderer` and `Viewport`.
- Fixed bundle size regressions by externalizing Three.js and R3F.
- Corrected state management re-render issues with granular hooks.

### Performance

- Added benchmark suite for engine interpolation and store operations.
- Optimized store throughput via temporal middleware pausing.

### Documentation

- Created initial documentation structure (`docs/`).
- Added `JULES_GUIDE.md` for AI agent instructions.
- Added `PROGRESS.md` to track project phases.
- Updated `claude.md` with current project state and architecture details.
