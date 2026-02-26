'use client';

/**
 * /editor page — Mounts the full Animatica editor.
 * Uses dynamic import for R3F Canvas (no SSR).
 */
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import — R3F Canvas cannot render on server
const EditorApp = dynamic(() => import('./EditorApp'), {
    ssr: false,
    loading: () => (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0f',
            color: '#666',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 14,
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>◆</div>
                <div>Loading Animatica Editor...</div>
            </div>
        </div>
    ),
});

export default function EditorPage() {
    return <EditorApp />;
}
