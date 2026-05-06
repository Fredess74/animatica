# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-05-06

### Added

- **Phase 2: Character System** implementation:
    - `Humanoid` character support with skeletal animation.
    - `BoneController` for procedural character posing and IK.
    - `FaceMorphController` and `EyeController` for character expressions.
    - `GLBLoader` and `CharacterLoader` for efficient asset management.
    - `CharacterPresets` including Cowboy, Robot, and Android.
- **Phase 3: Editor UI** enhancements:
    - `EditorLayout` with multi-panel system.
    - `Viewport` system with R3F Canvas, OrbitControls, and gizmos.
    - `TimelinePanel` for keyframe management and playback control.
    - `PropertiesPanel` for actor and environment configuration.
    - `AssetLibrary` for easy scene population.
    - `2D Storyboard mode` for rapid scene planning.
- **Phase 4: Export & Audio** initial support:
    - `ExportModal` for resolution and format selection.
- **Improved Testing**:
    - Benchmark suite for engine performance tracking.
    - Quality assurance tests for character animations.
    - Increased test coverage across engine and editor packages.

### Fixed

- Improved `PlaybackController` stability and frame-rate independence.
- Resolved R3F rendering issues in `PrimitiveRenderer` and `LightRenderer`.
- Fixed Zod schema validation for complex project states.

### Changed

- Updated dependency versions across the monorepo.
- Refined design tokens for the "Retro Futurism 71" theme.

### Removed

- **Compliance**: Removed all blockchain, Web3, and cryptocurrency related files and documentation (`packages/contracts`, `SMART_CONTRACTS.md`, etc.) to align with project focus.

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
