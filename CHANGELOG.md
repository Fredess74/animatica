# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-04-04

### Added

- **Phase 2: Characters** implementation:
    - Humanoid character system with ReadyPlayerMe support.
    - Bone controller for skeletal animation overrides.
    - Facial expressions and morph target controls.
    - Procedural clothing system.
- **Phase 3: Editor UI** implementation:
    - Three-panel responsive layout (Sidebar, Viewport, Timeline).
    - Asset Library for characters and props.
    - Properties Panel for transform and material editing.
    - Timeline Panel with keyframe management and playback controls.
    - Script Console for AI-generated scene imports.

### Changed

- Synchronized monorepo versions to 0.2.0.
- Standardized engine renderer architecture (memo/forwardRef) across all components.

### Removed

- Removed all Web3, blockchain, and cryptocurrency features and documentation to focus on core animation tools.

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
