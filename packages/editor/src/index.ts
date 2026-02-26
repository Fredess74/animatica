/**
 * @module @animatica/editor
 * Public API for the Animatica Editor package.
 */

export const EDITOR_VERSION = '0.3.0';

// === VIEWPORT ===
export { Viewport } from './viewport/Viewport';
export type { GizmoMode, TransformSpace, ViewPreset } from './viewport/Viewport';
export { PostprocessingPipeline, PostprocessingPresets } from './viewport/PostprocessingPipeline';
export { WeatherSystem } from './viewport/WeatherSystem';
export type { WeatherType } from './viewport/WeatherSystem';

// === LAYOUTS ===
export { EditorLayout } from './layouts/EditorLayout';

// === PANELS ===
export { AssetLibrary } from './panels/AssetLibrary';
export { PropertiesPanel } from './panels/PropertiesPanel';
export { TimelinePanel } from './panels/TimelinePanel';
export { CharacterPanel } from './panels/CharacterPanel';
export { AiPanel } from './panels/AiPanel';

// === MODALS ===
export { ScriptConsole } from './modals/ScriptConsole';
export { ExportModal } from './modals/ExportModal';

