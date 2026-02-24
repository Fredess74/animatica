// @Animatica/engine — Public API
// Re-exports all public types, components, schemas, and utilities.

// === TYPES ===
/**
 * Core type definitions for the Animatica Engine.
 * Includes Actors, Timeline, Environment, and Project structures.
 */
export * from './types/index'

// === SCHEMAS (Zod validation) ===
/**
 * Zod validation schemas for runtime data validation.
 * Includes ProjectStateSchema, ActorSchema, TimelineSchema, etc.
 */
export * from './schemas/index'

// === STORE ===
/**
 * The primary Zustand store hook for managing scene state.
 */
export { useSceneStore, getActorById, getActiveActors, getCurrentTime } from './store/sceneStore';

// === COMPONENTS (R3F) ===
/**
 * Renders primitive shapes (box, sphere, cylinder, etc.).
 */
export { PrimitiveRenderer } from './scene/renderers/PrimitiveRenderer'
/**
 * Renders light sources (point, spot, directional).
 */
export { LightRenderer } from './scene/renderers/LightRenderer'
/**
 * Renders camera helpers and manages the active camera.
 */
export { CameraRenderer } from './scene/renderers/CameraRenderer'
/**
 * Renders character models.
 */
export { CharacterRenderer } from './scene/renderers/CharacterRenderer'
/**
 * Renders 3D spatial audio sources.
 */
export { SpeakerRenderer } from './scene/renderers/SpeakerRenderer'
/**
 * The main scene orchestrator component. Use inside a Canvas.
 */
export { SceneManager } from './scene/SceneManager'

/**
 * Hook for controlling animation playback (play, pause, seek).
 */
export { usePlayback } from './playback/PlaybackController'

// === ANIMATION ===
/**
 * Easing functions for interpolation.
 */
export * as Easing from './animation/easing';
/**
 * Utilities for interpolating keyframes and tracks.
 */
export { interpolateKeyframes, evaluateTracksAtTime } from './animation/interpolate';

// === IMPORTER ===
/**
 * Parses and validates JSON scene scripts.
 */
export { importScript, validateScript, tryImportScript } from './importer/scriptImporter';

// === AI ===
/**
 * Generates structured prompts for LLMs to create scenes.
 */
export { getAiPrompt, PROMPT_STYLES } from './ai/promptTemplates';

// === CONFIG ===
/**
 * Feature flag system configuration and hooks.
 */
export { FeatureFlagProvider, useFeatureFlag, getFeatureFlags } from './config/featureFlags';
export type { FeatureFlags } from './config/featureFlags';
