# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-05-04

### Added

- **Phase 2: Characters** initial implementation:
    - `HumanoidRenderer` for ReadyPlayerMe and custom humanoid models.
    - `CharacterAnimator` for handling character-specific animation tracks.
    - `BoneController` for skeletal manipulation via `bodyPose`.
    - `FaceMorphController` for facial expressions via morph targets.
- **Phase 3: Editor UI** enhancements:
    - Implemented `Viewport` with R3F Canvas, OrbitControls, and Gizmos.
    - Improved `PropertiesPanel` with character-specific controls.
    - Integrated `TimelinePanel` with playback system.
- **2D Storyboard Mode**: Added support for 2D animation and storyboard visualization.
- **Performance Benchmarks**: Added comprehensive benchmark suite for engine performance tracking.

### Fixed

- Resolved bundle size regressions by externalizing heavy dependencies in Vite/Next.js configurations.
- Fixed `CharacterRenderer` visibility toggle logic to comply with React hook rules.
- Stabilized `Viewport.test.tsx` by mocking R3F and Drei components correctly.

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
