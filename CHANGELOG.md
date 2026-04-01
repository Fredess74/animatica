# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-30

### Fixed

- **Renderer Cleanup**: Fixed `CharacterRenderer.test.tsx` and `Viewport.test.tsx` to match current implementation and R3F mock requirements.
- **Rule #2 Compliance**: Removed all blockchain, Web3, and cryptocurrency related code, documentation, and database fields.

### Removed

- `packages/contracts/` directory and related hardhat configurations.
- `docs/SMART_CONTRACTS.md` and `docs/MONETIZATION.md`.
- Blockchain references from `README.md`, `ROADMAP.md`, `PROGRESS.md`, and `SUPABASE_SCHEMA.md`.

### Changed

- Updated version to 0.2.0 across all packages.
- Switched from Wei/ETH to cents/USD in database schema and documentation.
- Reorganized roadmap and progress to reflect removal of crypto phase.

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
