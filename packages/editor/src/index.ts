/**
 * @module @animatica/editor
 * Public API for the Animatica Editor package.
 */

export const EDITOR_VERSION = '0.1.0';

// === LAYOUTS ===
export { EditorLayout } from './layouts/EditorLayout';

// === PANELS ===
export { AssetLibrary } from './panels/AssetLibrary';
export { PropertiesPanel } from './panels/PropertiesPanel';
export { TimelinePanel } from './panels/TimelinePanel';

// === MODALS ===
export { ScriptConsole } from './modals/ScriptConsole';
export { ExportModal } from './modals/ExportModal';
