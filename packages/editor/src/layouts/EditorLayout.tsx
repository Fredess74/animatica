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
import { clsx } from 'clsx';
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface EditorLayoutProps {
    /** The R3F Canvas viewport to render in the center */
    viewport: React.ReactNode;
}

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 600;
const MIN_TIMELINE_HEIGHT = 100;
const MAX_TIMELINE_HEIGHT = 600;

const EditorContent: React.FC<EditorLayoutProps> = ({ viewport }) => {
    const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
    const [showScriptConsole, setShowScriptConsole] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // Panel dimensions
    const [leftWidth, setLeftWidth] = useState(280);
    const [rightWidth, setRightWidth] = useState(320);
    const [timelineHeight, setTimelineHeight] = useState(200);

    // Panel collapsed states
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
    const [isRightCollapsed, setIsRightCollapsed] = useState(false);
    const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);

    // Dragging state
    const isDragging = useRef<'left' | 'right' | 'timeline' | null>(null);

    const { showToast } = useToast();
    const {
        playback,
        setPlayback,
        removeActor
    } = useSceneStore();

    // --- Resizing Logic ---

    const startResize = useCallback((direction: 'left' | 'right' | 'timeline') => {
        isDragging.current = direction;
        document.body.style.cursor = direction === 'timeline' ? 'row-resize' : 'col-resize';
        document.body.style.userSelect = 'none'; // Prevent text selection
    }, []);

    const stopResize = useCallback(() => {
        isDragging.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    const handleResize = useCallback((e: MouseEvent) => {
        if (!isDragging.current) return;

        if (isDragging.current === 'left') {
            setLeftWidth(() => Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, e.clientX)));
        } else if (isDragging.current === 'right') {
            setRightWidth(() => Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, window.innerWidth - e.clientX)));
        } else if (isDragging.current === 'timeline') {
            setTimelineHeight(() => Math.max(MIN_TIMELINE_HEIGHT, Math.min(MAX_TIMELINE_HEIGHT, window.innerHeight - e.clientY)));
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleResize);
        window.addEventListener('mouseup', stopResize);
        return () => {
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', stopResize);
        };
    }, [handleResize, stopResize]);


    // --- Actions ---

    const handlePlayPause = useCallback(() => {
        setPlayback({ isPlaying: !playback.isPlaying });
        showToast(playback.isPlaying ? 'Paused' : 'Playing', 'info', 1500);
    }, [playback.isPlaying, setPlayback, showToast]);

    const handleSave = useCallback(() => {
        // In production: save to database or download JSON
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

    return (
        <div className="editor-layout">
            {/* Top Toolbar */}
            <header className="editor-toolbar">
                <div className="editor-toolbar__brand">
                    <span className="editor-toolbar__logo">◆</span>
                    <span className="editor-toolbar__title">Animatica</span>
                </div>

                <div className="editor-toolbar__center">
                    {/* Optional: Project Name or Breadcrumbs could go here */}
                </div>

                <nav className="editor-toolbar__actions">
                    <button
                        className="editor-btn editor-btn--ghost"
                        onClick={() => setShowScriptConsole(true)}
                        title="Open Script Console"
                    >
                        📜 Script
                    </button>
                    <button
                        className="editor-btn editor-btn--primary"
                        onClick={() => setShowExportModal(true)}
                        title="Export Video"
                    >
                        🎬 Export
                    </button>
                </nav>
            </header>

            {/* Retro Stripe Divider */}
            <div className="retro-stripe retro-stripe--thin" />

            {/* Main Content Area (Sidebars + Viewport) */}
            <div className="editor-main">
                {/* Left Sidebar — Asset Library */}
                <aside
                    className={clsx("editor-sidebar editor-sidebar--left", {
                        "editor-sidebar--collapsed": isLeftCollapsed
                    })}
                    style={{ width: isLeftCollapsed ? undefined : leftWidth }}
                >
                    <div className="editor-sidebar__header-controls">
                        <button
                            className="editor-sidebar__toggle"
                            onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                            title={isLeftCollapsed ? "Expand Assets" : "Collapse Assets"}
                        >
                            {isLeftCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        </button>
                    </div>

                    {!isLeftCollapsed && (
                        <div className="editor-sidebar__content">
                            <AssetLibrary onActorCreated={(id) => setSelectedActorId(id)} />
                        </div>
                    )}
                </aside>

                {/* Left Resizer */}
                {!isLeftCollapsed && (
                    <div
                        className="resizer resizer--vertical"
                        onMouseDown={() => startResize('left')}
                    />
                )}

                {/* Center — Viewport */}
                <main className="editor-viewport">
                    {viewport}
                </main>

                {/* Right Resizer */}
                {!isRightCollapsed && (
                    <div
                        className="resizer resizer--vertical"
                        onMouseDown={() => startResize('right')}
                    />
                )}

                {/* Right Sidebar — Properties */}
                <aside
                    className={clsx("editor-sidebar editor-sidebar--right", {
                        "editor-sidebar--collapsed": isRightCollapsed
                    })}
                    style={{ width: isRightCollapsed ? undefined : rightWidth }}
                >
                    <div className="editor-sidebar__header-controls">
                         <button
                            className="editor-sidebar__toggle"
                            onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                            title={isRightCollapsed ? "Expand Properties" : "Collapse Properties"}
                        >
                            {isRightCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>
                    </div>

                    {!isRightCollapsed && (
                        <div className="editor-sidebar__content">
                            <PropertiesPanel selectedActorId={selectedActorId} />
                        </div>
                    )}
                </aside>
            </div>

            {/* Timeline Resizer */}
            {!isTimelineCollapsed && (
                <div
                    className="resizer resizer--horizontal"
                    onMouseDown={() => startResize('timeline')}
                />
            )}

            {/* Bottom — Timeline */}
            <div
                className={clsx("editor-timeline", {
                    "editor-timeline--collapsed": isTimelineCollapsed
                })}
                style={{ height: isTimelineCollapsed ? undefined : timelineHeight }}
            >
                <div className="editor-timeline__header-controls">
                     <button
                        className="editor-timeline__toggle"
                        onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
                        title={isTimelineCollapsed ? "Expand Timeline" : "Collapse Timeline"}
                    >
                        {isTimelineCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>

                {!isTimelineCollapsed && (
                    <div className="editor-timeline__content">
                         <TimelinePanel selectedActorId={selectedActorId} />
                    </div>
                )}
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
