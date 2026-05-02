# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-05-01

### Added
- **BoneController**: Implemented skeletal bone rotation mapping for humanoid actors (head, spine, arms, legs).
- **2D Storyboard Mode**: Added support for 2D visualization of scenes.
- **Editor UI**: Completed 85% of Phase 3, including TimelinePanel, PropertiesPanel, and AssetLibrary.

### Changed
- Refactored `SceneManager` to use granular Zustand hooks for performance.
- Updated `CharacterRenderer` with skeletal animation and face morph blending.

### Fixed
- Stabilized test suite for `CharacterRenderer` and `Viewport`.
- Resolved vitest search path issues in monorepo packages.

### Removed
- **Web3/Blockchain**: Removed all references to "Earn", crypto, and smart contracts per project scope refinement.
- Deleted `packages/contracts` and `docs/SMART_CONTRACTS.md`.

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
