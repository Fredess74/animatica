# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Phase 2: Characters** (In Progress):
    - Humanoid base type definitions and schemas.
    - Bone Controller for skeletal mapping.
    - Morph Targets for facial expressions.
- **Phase 3: Editor UI** (Almost Done):
    - `EditorLayout` with 3-panel system.
    - `AssetLibrary` for actor creation.
    - `PropertiesPanel` for real-time attribute editing.
    - `TimelinePanel` for playback and keyframe management.
    - `ScriptConsole` for AI scene generation.
    - `ExportModal` for video export configuration.
- **Phase 5: AI Integration**:
    - AI prompt templates for scene generation.
    - Script importer enhancements.

### Changed

- Updated `JULES_GUIDE.md` to reflect strict rules against blockchain and Web3 topics.
- Reorganized monorepo structure for better package isolation.

### Removed

- Removed all blockchain, Web3, and cryptocurrency related references and placeholders.

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
