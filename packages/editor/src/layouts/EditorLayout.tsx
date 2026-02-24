/**
 * EditorLayout — Main editor shell with 3-panel layout.
 * Left sidebar (AssetLibrary), center viewport (R3F Canvas), right sidebar (Properties),
 * bottom bar (Timeline). Dark theme using design-tokens.css.
 * Wraps content in ToastProvider and handles keyboard shortcuts.
 *
 * @module @animatica/editor/layouts/EditorLayout
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSceneStore } from '@Animatica/engine';
import { AssetLibrary } from '../panels/AssetLibrary';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { TimelinePanel } from '../panels/TimelinePanel';
import { ScriptConsole } from '../modals/ScriptConsole';
import { ExportModal } from '../modals/ExportModal';
import { ToastProvider, useToast } from '../components/ToastContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { ChevronLeft, ChevronRight, PanelLeft, PanelRight } from 'lucide-react';

interface EditorLayoutProps {
    /** The R3F Canvas viewport to render in the center */
    viewport: React.ReactNode;
}

// Resizer Component
const Resizer: React.FC<{
    onResize: (delta: number) => void;
}> = ({ onResize }) => {
    const isDragging = useRef(false);
    const startX = useRef(0);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDragging.current = true;
        startX.current = e.clientX;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none'; // Prevent text selection
        e.preventDefault();
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            const delta = e.clientX - startX.current;
            onResize(delta);
            startX.current = e.clientX;
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [onResize]);

    return (
        <div
            className="editor-resizer"
            onMouseDown={handleMouseDown}
            role="separator"
            aria-orientation="vertical"
        />
    );
};

const EditorContent: React.FC<EditorLayoutProps> = ({ viewport }) => {
    const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
    const [showScriptConsole, setShowScriptConsole] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // Layout State
    const [leftWidth, setLeftWidth] = useState(280);
    const [rightWidth, setRightWidth] = useState(320);
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
    const [isRightCollapsed, setIsRightCollapsed] = useState(false);

    const { showToast } = useToast();
    const {
        playback,
        setPlayback,
        removeActor
    } = useSceneStore();

    const handleResizeLeft = useCallback((delta: number) => {
        setLeftWidth(w => Math.max(200, Math.min(600, w + delta)));
    }, []);

    const handleResizeRight = useCallback((delta: number) => {
        setRightWidth(w => Math.max(200, Math.min(600, w - delta)));
    }, []);

    const handlePlayPause = useCallback(() => {
        setPlayback({ isPlaying: !playback.isPlaying });
        showToast(playback.isPlaying ? 'Paused' : 'Playing', 'info', 1500);
    }, [playback.isPlaying, setPlayback, showToast]);

    const handleSave = useCallback(() => {
        showToast('Project saved successfully!', 'success');
        console.log('Project saved');
    }, [showToast]);

    const handleUndo = useCallback(() => {
        showToast('Undo not implemented yet', 'info');
    }, [showToast]);

    const handleDelete = useCallback(() => {
        if (selectedActorId) {
            removeActor(selectedActorId);
            setSelectedActorId(null);
            showToast('Actor removed', 'info');
        }
    }, [selectedActorId, removeActor, showToast]);

    const handleEscape = useCallback(() => {
        if (showScriptConsole) {
            setShowScriptConsole(false);
        } else if (showExportModal) {
            setShowExportModal(false);
        } else if (selectedActorId) {
            setSelectedActorId(null);
            showToast('Actor deselected', 'info', 1000);
        }
    }, [showScriptConsole, showExportModal, selectedActorId, showToast]);

    useKeyboardShortcuts({
        onPlayPause: handlePlayPause,
        onSave: handleSave,
        onUndo: handleUndo,
        onDelete: handleDelete,
        onEscape: handleEscape,
    });

    // Pass dynamic widths via CSS variables
    const layoutStyle = {
        '--left-sidebar-width': isLeftCollapsed ? '40px' : `${leftWidth}px`,
        '--right-sidebar-width': isRightCollapsed ? '40px' : `${rightWidth}px`,
    } as React.CSSProperties;

    return (
        <div className="editor-layout" style={layoutStyle}>
            {/* Top Toolbar */}
            <header className="editor-toolbar">
                <div className="editor-toolbar__brand">
                    <span className="editor-toolbar__logo">◆</span>
                    <span className="editor-toolbar__title">Animatica</span>
                </div>
                <nav className="editor-toolbar__actions">
                    <button
                        className="editor-btn editor-btn--ghost"
                        onClick={() => setShowScriptConsole(true)}
                    >
                        📜 Script
                    </button>
                    <button
                        className="editor-btn editor-btn--primary"
                        onClick={() => setShowExportModal(true)}
                    >
                        🎬 Export
                    </button>
                </nav>
            </header>

            {/* Retro Stripe Divider */}
            <div className="retro-stripe retro-stripe--thin" />

            {/* Main Content */}
            <div className="editor-main">
                {/* Left Sidebar — Asset Library */}
                <aside className={`editor-sidebar editor-sidebar--left ${isLeftCollapsed ? 'editor-sidebar--collapsed' : ''}`}>
                    <div className="panel__header">
                         {!isLeftCollapsed && <span className="panel__title">Library</span>}
                         <button
                            className="panel__toggle"
                            onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                            aria-label={isLeftCollapsed ? "Expand library" : "Collapse library"}
                         >
                            {isLeftCollapsed ? <PanelLeft size={16} /> : <ChevronLeft size={16} />}
                         </button>
                    </div>
                    <AssetLibrary onActorCreated={(id) => setSelectedActorId(id)} />
                </aside>

                <Resizer onResize={handleResizeLeft} />

                {/* Center — Viewport */}
                <main className="editor-viewport">
                    {viewport}
                </main>

                <Resizer onResize={handleResizeRight} />

                {/* Right Sidebar — Properties */}
                <aside className={`editor-sidebar editor-sidebar--right ${isRightCollapsed ? 'editor-sidebar--collapsed' : ''}`}>
                    <div className="panel__header">
                         {!isRightCollapsed && <span className="panel__title">Properties</span>}
                         <button
                            className="panel__toggle"
                            onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                            aria-label={isRightCollapsed ? "Expand properties" : "Collapse properties"}
                         >
                            {isRightCollapsed ? <PanelRight size={16} /> : <ChevronRight size={16} />}
                         </button>
                    </div>
                    <PropertiesPanel selectedActorId={selectedActorId} />
                </aside>
            </div>

            {/* Bottom — Timeline */}
            <div className="editor-timeline">
                <TimelinePanel selectedActorId={selectedActorId} />
            </div>

            {/* Modals */}
            {showScriptConsole && (
                <ScriptConsole onClose={() => setShowScriptConsole(false)} />
            )}
            {showExportModal && (
                <ExportModal onClose={() => setShowExportModal(false)} />
            )}
        </div>
    );
};

export const EditorLayout: React.FC<EditorLayoutProps> = (props) => {
    return (
        <ToastProvider>
            <EditorContent {...props} />
        </ToastProvider>
    );
};
