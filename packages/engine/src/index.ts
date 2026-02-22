// @Animatica/engine — Public API
// Re-exports all public types, components, schemas, and utilities.

// === TYPES ===
export * from './types/index'

// === SCHEMAS (Zod validation) ===
export * from './schemas/index'

// === STORE ===
export { useSceneStore, getActorById, getActiveActors, getCurrentTime } from './store/sceneStore';

// === COMPONENTS (R3F) ===
export { PrimitiveRenderer } from './scene/renderers/PrimitiveRenderer'
// export { SceneManager } from './scene/SceneManager'
// export { PlaybackController } from './playback/PlaybackController'

// === ANIMATION ===
export * as Easing from './animation/easing';
export { interpolateKeyframes, evaluateTracksAtTime } from './animation/interpolate';

// === IMPORTER ===
export { importScript, validateScript, tryImportScript } from './importer/scriptImporter';

// === AI ===
export { getAiPrompt, PROMPT_STYLES } from './ai/promptTemplates';
