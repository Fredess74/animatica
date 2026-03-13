'use client';

/**
 * EditorApp — Client-only component that wires EditorLayout + Viewport.
 * Separated from page.tsx to enable dynamic import (no SSR).
 */
import React from 'react';
import { EditorLayout, Viewport } from '@Animatica/editor';

export default function EditorApp() {
    return (
        <EditorLayout
            viewport={<Viewport />}
        />
    );
}
