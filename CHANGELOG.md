# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-07

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
- **Phase 2: Characters** (30% Complete):
    - `CharacterRenderer` with `memo`, `forwardRef`, and `useImperativeHandle` implementation.
    - `CharacterLoader` for procedural humanoid skeletons.
    - `CharacterAnimator` with base clips for Idle and Walk.
    - `FaceMorphController` and `EyeController` for facial expressions and blinks.
- **Phase 3: Editor UI** (85% Complete):
    - `EditorLayout` for 3-panel workspace.
    - `AssetLibrary`, `PropertiesPanel`, `TimelinePanel`.
    - `ScriptConsole` for AI scene building.
    - `ExportModal` for video configuration.

### Changed

- Updated `README.md` to remove all blockchain, crypto, and Web3 references.
- Refactored `CharacterRenderer` to comply with Rules of Hooks and provide ref access for parent components.
- Standardized unit test mocks for React and R3F components.

### Fixed

- Resolved 30+ TypeScript errors across the engine and apps related to `PlaybackState` and import paths.
- Fixed `CharacterRenderer` unit tests that were failing due to missing component properties and rig structure mismatches.

### Documentation

- Created initial documentation structure (`docs/`).
- Added `JULES_GUIDE.md` for AI agent instructions.
- Added `PROGRESS.md` to track project phases.
- Created `WEB3_READINESS.md` to document the pivot away from blockchain technologies.
- Added `RELEASE_CHECKLIST.md` for release verification procedures.
