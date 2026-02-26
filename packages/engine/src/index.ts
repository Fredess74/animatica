// @Animatica/engine — Public API
// Re-exports all public types, components, schemas, and utilities.

// === TYPES ===
export * from './types/index'

// === SCHEMAS (Zod validation) ===
export * from './importer/schemas/index'

// === STORE ===
export {
  useSceneStore,
  getActorById,
  getActiveActors,
  getCurrentTime,
  useActorById,
  useActorIds,
  useCurrentTime,
  useIsPlaying,
  useSelectedActorId,
  useSelectedActor,
  useActorsByType,
  useActorList,
} from './store/sceneStore';

// === COMPONENTS (R3F) ===
export { PrimitiveRenderer } from './scene/renderers/PrimitiveRenderer'
export { LightRenderer } from './scene/renderers/LightRenderer'
export { CameraRenderer } from './scene/renderers/CameraRenderer'
export { CharacterRenderer } from './scene/renderers/CharacterRenderer'
export { SceneManager } from './scene/SceneManager'
export { usePlayback } from './playback/PlaybackController'

// === CHARACTER SYSTEM ===
export * from './character/index'

// === GLB MODEL LOADING ===
export { parseGLBResult, glbToCharacterRig, BUNDLED_MODELS } from './character/GLBLoader'
export type { GLBLoadResult, BundledModel } from './character/GLBLoader'

// === ANIMATION ===
export * as Easing from './animation/easing';
export { interpolateKeyframes, evaluateTracksAtTime } from './animation/interpolate';

// === IMPORTER ===
export { importScript, validateScript, tryImportScript } from './importer/scriptImporter';

// === CAMERA RIG ===
export { CameraRig, CAMERA_SHOTS } from './camera/CameraRig'
export type { CameraMovement } from './camera/CameraRig'

// === AI ===
export { getAiPrompt, PROMPT_STYLES } from './ai/promptTemplates';

// === CONFIG ===
export { FeatureFlagProvider, useFeatureFlag, getFeatureFlags } from './config/featureFlags';
export type { FeatureFlags } from './config/featureFlags';

