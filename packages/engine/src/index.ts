// @Animatica/engine — Public API
// Re-exports all public types, components, schemas, and utilities.

// === TYPES ===
export * from './types/index'

// === SCHEMAS (Zod validation) ===
export * from './schemas/index'

// === STORE ===
export { getActiveActors, getActorById, getCurrentTime, useSceneStore } from './store/sceneStore'

// === COMPONENTS (R3F) ===
export { CameraRenderer } from './scene/renderers/CameraRenderer'
export { CharacterRenderer } from './scene/renderers/CharacterRenderer'
export { LightRenderer } from './scene/renderers/LightRenderer'
export { PrimitiveRenderer } from './scene/renderers/PrimitiveRenderer'
// export { SceneManager } from './scene/SceneManager'
export { SceneManager } from './scene/SceneManager'
// export { PlaybackController } from './playback/PlaybackController'
export { usePlayback } from './playback/PlaybackController'

// === ANIMATION ===
export * as Easing from './animation/easing'
export { evaluateTracksAtTime, interpolateKeyframes } from './animation/interpolate'

// === IMPORTER ===
export { importScript, tryImportScript, validateScript } from './importer/scriptImporter'

// === AI ===
export { getAiPrompt, PROMPT_STYLES } from './ai/promptTemplates'

// === CONFIG ===
export type { FeatureFlags } from './config/featureFlags'
export { FeatureFlagProvider, getFeatureFlags, useFeatureFlag } from './config/featureFlags'
