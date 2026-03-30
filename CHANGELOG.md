# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-30

### Added

- **Phase 2: Characters** & **Phase 3: Editor UI** progress:
    - `CharacterRenderer` with procedural humanoid support and skeletal animation.
    - Bone control system for humanoid posing.
    - Morph target support for facial expressions.
    - Editor layout with three-panel system.
    - Asset library, properties panel, and timeline UI components.
    - Viewport implementation with R3F, OrbitControls, and gizmos.

### Changed

- Refactored `CharacterRenderer` to align with the engine's architectural standards using `memo` and `forwardRef`.
- Synchronized versioning across the monorepo to 0.2.0.

### Fixed

- Resolved unit test failures in `CharacterRenderer.test.tsx`.
- Removed legacy Web3 and blockchain artifacts to strictly comply with Rule #2 of `JULES_GUIDE.md`.

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
