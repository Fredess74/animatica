/**
 * EditorLayout — Main editor shell with 3-panel layout.
 * Left sidebar (AssetLibrary), center viewport (R3F Canvas), right sidebar (Properties),
 * bottom bar (Timeline). Dark theme using design-tokens.css.
 * Wraps content in ToastProvider and handles keyboard shortcuts.
 *
 * @module @animatica/editor/layouts/EditorLayout
 */
import React, { useState, useCallback, useMemo } from 'react';
import { useSceneStore } from '@Animatica/engine';
import { AssetLibrary } from '../panels/AssetLibrary';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { TimelinePanel } from '../panels/TimelinePanel';
import { ScriptConsole } from '../modals/ScriptConsole';
import { ExportModal } from '../modals/ExportModal';
import { ToastProvider, useToast } from '../components/ToastContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useResizable } from '../hooks/useResizable';
import {
    PanelLeftClose,
    PanelLeftOpen,
    PanelRightClose,
    PanelRightOpen,
    ChevronUp,
    ChevronDown,
    GripVertical
} from 'lucide-react';

interface EditorLayoutProps {
    /** The R3F Canvas viewport to render in the center */
    viewport: React.ReactNode;
}

const Resizer = ({
    orientation,
    onMouseDown,
    isResizing
}: {
    orientation: 'horizontal' | 'vertical',
    onMouseDown: (e: React.MouseEvent) => void,
    isResizing: boolean
}) => (
    <div
        className={`resizer resizer--${orientation} ${isResizing ? 'resizing' : ''}`}
        onMouseDown={onMouseDown}
    >
        <div className="resizer-handle">
            {orientation === 'vertical' && <GripVertical size={12} />}
        </div>
    </div>
);

const EditorContent: React.FC<EditorLayoutProps> = ({ viewport }) => {
    const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
    const [showScriptConsole, setShowScriptConsole] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // Panel State
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
    const [isRightCollapsed, setIsRightCollapsed] = useState(false);
    const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);

    // Resizing
    const leftPanel = useResizable({
        initialSize: 280,
        minSize: 200,
        maxSize: 500,
        direction: 'horizontal'
    });

    const rightPanel = useResizable({
        initialSize: 320,
        minSize: 250,
        maxSize: 500,
        direction: 'horizontal',
        reverse: true
    });

    const timelinePanel = useResizable({
        initialSize: 200,
        minSize: 100,
        maxSize: 600,
        direction: 'vertical',
        reverse: true
    });

    const { showToast } = useToast();
    const {
        playback,
        setPlayback,
        removeActor
    } = useSceneStore();

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

    const layoutStyle = useMemo(() => ({
        '--left-sidebar-width': isLeftCollapsed ? '0px' : `${leftPanel.size}px`,
        '--right-sidebar-width': isRightCollapsed ? '0px' : `${rightPanel.size}px`,
        '--timeline-height': isTimelineCollapsed ? '32px' : `${timelinePanel.size}px`,
    } as React.CSSProperties), [
        leftPanel.size, rightPanel.size, timelinePanel.size,
        isLeftCollapsed, isRightCollapsed, isTimelineCollapsed
    ]);

    return (
        <div className="editor-layout" style={layoutStyle}>
            {/* Top Toolbar */}
            <header className="editor-toolbar">
                <div className="editor-toolbar__brand">
                     <button
                        data-testid="toggle-left-sidebar"
                        className="editor-btn editor-btn--ghost editor-btn--icon"
                        onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                        title={isLeftCollapsed ? "Show Sidebar" : "Hide Sidebar"}
                    >
                        {isLeftCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>

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

                    <button
                        data-testid="toggle-right-sidebar"
                        className="editor-btn editor-btn--ghost editor-btn--icon"
                        onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                        title={isRightCollapsed ? "Show Properties" : "Hide Properties"}
                    >
                        {isRightCollapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
                    </button>
                </nav>
            </header>

            {/* Retro Stripe Divider */}
            <div className="retro-stripe retro-stripe--thin" />

            {/* Main Content */}
            <div className="editor-main">
                {/* Left Sidebar — Asset Library */}
                <aside className={`editor-sidebar editor-sidebar--left ${isLeftCollapsed ? 'collapsed' : ''}`}>
                    <div className="sidebar-content">
                        <AssetLibrary onActorCreated={(id) => setSelectedActorId(id)} />
                    </div>
                </aside>

                {!isLeftCollapsed && (
                    <Resizer
                        orientation="vertical"
                        onMouseDown={leftPanel.startResizing}
                        isResizing={leftPanel.isResizing}
                    />
                )}

                {/* Center — Viewport */}
                <main className="editor-viewport">
                    {viewport}
                </main>

                {!isRightCollapsed && (
                    <Resizer
                        orientation="vertical"
                        onMouseDown={rightPanel.startResizing}
                        isResizing={rightPanel.isResizing}
                    />
                )}

                {/* Right Sidebar — Properties */}
                <aside className={`editor-sidebar editor-sidebar--right ${isRightCollapsed ? 'collapsed' : ''}`}>
                    <div className="sidebar-content">
                        <PropertiesPanel selectedActorId={selectedActorId} />
                    </div>
                </aside>
            </div>

            {/* Timeline Resizer */}
            {!isTimelineCollapsed && (
                <Resizer
                    orientation="horizontal"
                    onMouseDown={timelinePanel.startResizing}
                    isResizing={timelinePanel.isResizing}
                />
            )}

            {/* Bottom — Timeline */}
            <div className={`editor-timeline ${isTimelineCollapsed ? 'collapsed' : ''}`}>
                <div
                    data-testid="toggle-timeline"
                    className="timeline-header-toggle"
                    onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
                    title={isTimelineCollapsed ? "Show Timeline" : "Hide Timeline"}
                >
                    {isTimelineCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    <span className="timeline-header-label">Timeline</span>
                </div>

                <div className="timeline-content">
                    <TimelinePanel selectedActorId={selectedActorId} />
                </div>
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
