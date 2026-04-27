# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Phase 2 (Characters) progress: Base types and humanoid rig foundation.
- Phase 3 (Editor UI) progress: Layout, panels, and script console components.
- Integrated `BoneController` for manual character posing.
- Enhanced `CharacterRenderer` with visibility guards and selection indicators.
- Performance benchmarks for engine core components.

### Changed
- Refactored Zod schemas to `packages/engine/src/importer/schemas/`.
- Optimized Zustand store with granular hooks and `useShallow`.
- Standardized test suites with `jsdom` and comprehensive R3F mocks.

### Fixed
- Resolved character rendering visibility issues.
- Fixed `CharacterAnimator` initialization errors in functional components.
- Corrected bundle size regressions by externalizing Three.js dependencies.

### Removed
- Forbidden blockchain, Web3, and cryptocurrency references from documentation.
- Legacy `packages/contracts` and associated smart contract documentation.

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
