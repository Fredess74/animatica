/**
 * @module @animatica/editor
 * Public API for the Animatica Editor package.
 */

export const EDITOR_VERSION = '0.4.0';

// === VIEWPORT ===
export { Viewport } from './viewport/Viewport';
export type { GizmoMode, TransformSpace, ViewPreset } from './viewport/Viewport';
export { PostprocessingPipeline, PostprocessingPresets } from './viewport/PostprocessingPipeline';
export { WeatherSystem } from './viewport/WeatherSystem';
export type { WeatherType } from './viewport/WeatherSystem';
export { CinematicCamera, LENS_PRESETS, focalLengthToFov, fovToFocalLength } from './viewport/CinematicCamera';
export type { LensPreset, ShakePreset } from './viewport/CinematicCamera';
export { CompositionGuides } from './viewport/CompositionGuides';
export type { GuideType, AspectRatio, SafeAreaType } from './viewport/CompositionGuides';
export { PlaybackBar } from './viewport/PlaybackBar';

// === LAYOUTS ===
export { EditorLayout } from './layouts/EditorLayout';

// === PANELS ===
export { AssetLibrary } from './panels/AssetLibrary';
export { PropertiesPanel } from './panels/PropertiesPanel';
export { TimelinePanel } from './panels/TimelinePanel';
export { CharacterPanel } from './panels/CharacterPanel';
export { AiPanel } from './panels/AiPanel';
export { ModelBrowser } from './panels/ModelBrowser';
export { StoryboardPanel } from './panels/StoryboardPanel';
export { ScriptPanel } from './panels/ScriptPanel';

// === MODALS ===
export { ScriptConsole } from './modals/ScriptConsole';
export { ExportModal } from './modals/ExportModal';

