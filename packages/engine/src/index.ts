/**
 * @module @animatica/engine
 * @description The core engine package for the Animatica animation platform.
 * Provides the scene graph, animation system, renderer components, and state management.
 */

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
// export { SceneManager } from './scene/SceneManager'
export { SceneManager } from './scene/SceneManager'
// export { PlaybackController } from './playback/PlaybackController'
export { usePlayback } from './playback/PlaybackController'

// === ANIMATION ===
export * as Easing from './animation/easing';
export { interpolateKeyframes, evaluateTracksAtTime } from './animation/interpolate';

// === IMPORTER ===
export { importScript, validateScript, tryImportScript } from './importer/scriptImporter';

// === AI ===
export { getAiPrompt, PROMPT_STYLES } from './ai/promptTemplates';

// === CONFIG ===
export { FeatureFlagProvider, useFeatureFlag, getFeatureFlags } from './config/featureFlags';
export type { FeatureFlags } from './config/featureFlags';
