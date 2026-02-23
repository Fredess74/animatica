/**
 * @Animatica/engine — Public API
 *
 * The core engine package for the Animatica animation platform.
 * Provides types, state management, R3F renderers, and animation utilities.
 *
 * @module @animatica/engine
 */

// === TYPES ===
export * from './types/index'

// === SCHEMAS (Zod validation) ===
export * from './schemas/index'

// === STORE ===
export { useSceneStore, getActorById, getActiveActors, getCurrentTime, useActorById, useSelectedActor, useActorsByType, useActorList } from './store/sceneStore';

// === COMPONENTS (R3F) ===
export { PrimitiveRenderer } from './scene/renderers/PrimitiveRenderer'
export { LightRenderer } from './scene/renderers/LightRenderer'
export { CameraRenderer } from './scene/renderers/CameraRenderer'
export { CharacterRenderer } from './scene/renderers/CharacterRenderer'
export { SceneManager } from './scene/SceneManager'

// === PLAYBACK ===
export { usePlayback } from './playback/PlaybackController'

// === ANIMATION ===
export * as Easing from './animation/easing';
export { interpolateKeyframes, evaluateTracksAtTime } from './animation/interpolate';

// === IMPORTER ===
export { importScript, validateScript, tryImportScript } from './importer/scriptImporter';

// === AI ===
export { getAiPrompt, PROMPT_STYLES } from './ai/promptTemplates';
