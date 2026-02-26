/**
 * @module @animatica/editor
 * Public API for the Animatica Editor package.
 */

export const EDITOR_VERSION = '0.2.0';

// === VIEWPORT ===
export { Viewport } from './viewport/Viewport';
export type { GizmoMode, TransformSpace, ViewPreset } from './viewport/Viewport';

// === LAYOUTS ===
export { EditorLayout } from './layouts/EditorLayout';

// === PANELS ===
export { AssetLibrary } from './panels/AssetLibrary';
export { PropertiesPanel } from './panels/PropertiesPanel';
export { TimelinePanel } from './panels/TimelinePanel';
export { CharacterPanel } from './panels/CharacterPanel';

// === MODALS ===
export { ScriptConsole } from './modals/ScriptConsole';
export { ExportModal } from './modals/ExportModal';

