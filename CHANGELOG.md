# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Engine
- **SpeakerRenderer**: Added component for spatial audio rendering and tests.
- **SceneManager**: Added unit tests.
- **CharacterRenderer**: Added initial placeholder component.
- **Feature Flags**: Implemented feature flag system in `src/config/featureFlags.ts`.

#### Editor
- **Styling**: Added CSS for editor components (panels, timeline, modals) aligned with design tokens.
- **Tests**: Added unit tests for `AssetLibrary`, `PropertiesPanel`, and `TimelinePanel`.

### Changed

#### Editor
- **PropertiesPanel**: Wired panel to `useSceneStore` for reading/writing actor properties.
- **Internationalization**: Extracted hardcoded UI strings to translation keys.

### Fixed/Improved

#### Engine
- **Type Safety**: Audited and improved TypeScript definitions, return types, and removed `any` usage.
- **Performance**: Audited components for unnecessary re-renders and bundle size optimizations.

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
