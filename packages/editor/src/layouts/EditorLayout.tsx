/**
 * EditorLayout — Main editor shell with 3-panel layout.
 * Left sidebar (AssetLibrary), center viewport (R3F Canvas), right sidebar (Properties),
 * bottom bar (Timeline). Dark theme using design-tokens.css.
 * Wraps content in ToastProvider and handles keyboard shortcuts.
 *
 * @module @animatica/editor/layouts/EditorLayout
 */
import React, { useState, useCallback } from 'react';
import { useSceneStore } from '@Animatica/engine';
import { AssetLibrary } from '../panels/AssetLibrary';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { TimelinePanel } from '../panels/TimelinePanel';
import { ScriptConsole } from '../modals/ScriptConsole';
import { ExportModal } from '../modals/ExportModal';
import { ToastProvider, useToast } from '../components/ToastContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface EditorLayoutProps {
    /** The R3F Canvas viewport to render in the center */
    viewport: React.ReactNode;
}

const EditorContent: React.FC<EditorLayoutProps> = ({ viewport }) => {
    const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
    const [showScriptConsole, setShowScriptConsole] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

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

    return (
        <div className="editor-layout">
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
                <aside className="editor-sidebar editor-sidebar--left">
                    <AssetLibrary onActorCreated={(id) => setSelectedActorId(id)} />
                </aside>

                {/* Center — Viewport */}
                <main className="editor-viewport">
                    {viewport}
                </main>

                {/* Right Sidebar — Properties */}
                <aside className="editor-sidebar editor-sidebar--right">
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
