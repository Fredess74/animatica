# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-05-07

### Added

- **Phase 2: Characters** implementation:
    - `HumanoidRenderer` for rendering bone-rigged 3D characters.
    - `BoneController` for procedural character posing and skeletal animation.
    - `CharacterLoader` with GLB support and fallback mechanisms.
    - Character presets and morph target controls.
- **Phase 3: Editor UI** implementation:
    - 3-panel responsive layout with sidebar panels (Asset Library, Properties, Timeline).
    - Advanced Viewport with R3F, OrbitControls, and transform gizmos.
    - 2D Storyboard mode for quick scene blocking.
    - i18n support for the editor interface.
- **Phase 5: AI Integration** foundation:
    - Enhanced `ScriptImporter` with Zod-validated character support.
    - Refined AI prompt templates for better scene generation.
- Foundational `platform` package with Supabase schema.

### Changed

- Updated design tokens for 'Retro Futurism 71' theme consistency.
- Improved engine performance for high-actor counts.

### Removed

- All blockchain, Web3, and cryptocurrency references from documentation and code.
- `packages/contracts` and related smart contract documentation.

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
