/**
 * EditorLayout — Main editor shell with 3-panel layout.
 * Left sidebar (AssetLibrary), center viewport (R3F Canvas), right sidebar (Properties),
 * bottom bar (Timeline). Dark theme using design-tokens.css.
 *
 * @module @animatica/editor/layouts/EditorLayout
 */
import React, { useState } from 'react';
import { AssetLibrary } from '../panels/AssetLibrary';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { TimelinePanel } from '../panels/TimelinePanel';
import { ScriptConsole } from '../modals/ScriptConsole';
import { ExportModal } from '../modals/ExportModal';

interface EditorLayoutProps {
    /** The R3F Canvas viewport to render in the center */
    viewport: React.ReactNode;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ viewport }) => {
    const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
    const [showScriptConsole, setShowScriptConsole] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

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
                <main className="editor-viewport">{viewport}</main>

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
